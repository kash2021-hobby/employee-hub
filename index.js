const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');
require('dotenv').config();

const bot = new Telegraf("8226813354:AAGjc6ChhI3GoTSDkVJp8whULObuO5N6YQk");
const API_BASE = "http://localhost:3000/api"; 

let userState = {}; 

// 1. START: First choice is always Attendance or Leave
bot.start((ctx) => {
    const userId = ctx.from.id;
    userState[userId] = { step: 'choose_main_action' };
    
    ctx.reply("Welcome! Please select an option to begin:", 
        Markup.keyboard([['Attendance 📅', 'Leave 🏖️']]).resize().oneTime()
    );
});

bot.on('text', async (ctx) => {
    const userId = ctx.from.id;
    const text = ctx.message.text;

    if (!userState[userId]) return ctx.reply("Please type /start to begin.");
    const state = userState[userId];

    // --- STEP 1: Main Menu Selection ---
   // --- STEP 1: Main Menu Selection (Updated with Holiday Check) ---
if (state.step === 'choose_main_action') {
    state.actionType = text;

    if (text === 'Attendance 📅') {
        try {
            // 1. Fetch holidays from your API
            const holidayRes = await axios.get(`${API_BASE}/holidays`);
            const today = new Date().toISOString().split('T')[0]; // Current date YYYY-MM-DD
            const activeHoliday = holidayRes.data.find(h => h.date === today);

            // 2. If it is a holiday, block and reset
            if (activeHoliday) {
                delete userState[userId];
                return ctx.reply(
                    `🚫 Attendance is disabled today.\n\nReason: ${activeHoliday.name}\nEnjoy your holiday!`, 
                    Markup.removeKeyboard()
                );
            }
        } catch (error) {
            console.error("Holiday API Error:", error.message);
            return ctx.reply("⚠️ Unable to verify holiday status. Please try again later.");
        }
    }

    // 3. If it's NOT a holiday (or if they chose Leave), proceed to ask for phone
    state.step = 'awaiting_phone';
    return ctx.reply("Please enter your registered Phone Number to verify your identity:", Markup.removeKeyboard());
}

    // --- STEP 2: Unified Identity Verification ---
    // --- STEP 2: Unified Identity Verification & New Member Handling ---
// --- STEP 2: Identity Verification & Redirection ---
if (state.step === 'awaiting_phone') {
    try {
        // 1. Attempt to verify against the main Employee table
        const response = await axios.get(`${API_BASE}/employees/verify/${text}`);
        const employee = response.data;

        state.employeeId = employee.id;
        state.employeeName = employee.full_name;

        // Redirect verified employees to their requested branch
        if (state.actionType === 'Attendance 📅') {
            state.step = 'att_menu';
            return ctx.reply(`Identity Verified: ${employee.full_name}. \nChoose an action:`, 
                Markup.keyboard([['Sign In ✅', 'Sign Out ❌']]).resize());
        } else {
            state.step = 'leave_type';
            return ctx.reply("Select Leave Type:", Markup.keyboard([['medical', 'planned', 'happy']]).resize());
        }

    } catch (error) {
        // 2. If phone not found (404), switch to New Member flow
        if (error.response && error.response.status === 404) {
            state.tempNumber = text; // Store the number for the API call
            state.step = 'new_member_registration';
            return ctx.reply("❌ Number not recognized. \n\nTo register as a New Member, please enter your Full Name:");
        } else {
            return ctx.reply("⚠️ Connection error. Please try again later.");
        }
    }
}

// --- STEP 3: Submit New Member Details (POST to /api/members) ---
if (state.step === 'new_member_registration') {
    try {
        // Using your specific New Member API endpoint
        await axios.post(`${API_BASE}/members`, {
            name: text,           // Name entered by user
            number: state.tempNumber // Phone number entered in previous step
        });

        await ctx.reply(`✅ Request submitted for ${text}. \n\nYour details are saved. Please wait for the Manager to approve your account.`);
    } catch (err) {
        await ctx.reply(`⚠️ Registration failed: ${err.response?.data?.error || "Server Error"}`);
    }
    
    // Always reset the session so they start fresh after approval
    delete userState[userId]; 
    return ctx.reply("Session ended. Type /start to begin again.");
}

    // --- STEP 3A: Attendance Logic ---
    if (state.step === 'att_menu') {
        try {
            if (text === 'Sign In ✅') {
                await axios.post(`${API_BASE}/attendance/clock-in`, { employee_id: state.employeeId });
                await ctx.reply(`✅ Sign-in successful for ${state.employeeName}.`);
            } else if (text === 'Sign Out ❌') {
                const res = await axios.put(`${API_BASE}/attendance/clock-out`, { employee_id: state.employeeId });
                await ctx.reply(`❌ Sign-out successful. \nTotal hours: ${res.data.total_hours}`);
            }
        } catch (err) {
            const errorMsg = err.response?.data?.error || "Connection error.";
            await ctx.reply(`⚠️ ${errorMsg}`);
        }
        delete userState[userId]; // Reset session to start over
        return ctx.reply("Process complete. Use /start for a new request.");
    }

    // --- STEP 3B: Leave Logic ---
    if (state.step === 'leave_type') {
        state.leaveType = text;
        state.step = 'leave_dates';
        return ctx.reply("Enter dates (Format: YYYY-MM-DD to YYYY-MM-DD):", Markup.removeKeyboard());
    }

    if (state.step === 'leave_dates') {
        const dates = text.split(' to ');
        if (dates.length !== 2) return ctx.reply("❌ Format error. Use: YYYY-MM-DD to YYYY-MM-DD");

        try {
            await axios.post(`${API_BASE}/leaves`, {
                employee_id: state.employeeId,
                leave_type: state.leaveType,
                start_date: dates[0].trim(),
                end_date: dates[1].trim(),
                reason: "Submitted via Bot"
            });
            await ctx.reply(`✅ ${state.leaveType} leave request submitted for ${state.employeeName}.`);
        } catch (err) {
            await ctx.reply(`⚠️ Error: ${err.response?.data?.error || "Submission failed."}`);
        }
        delete userState[userId]; // Reset session to start over
        return ctx.reply("Process complete. Use /start for a new request.");
    }
});

bot.launch();
console.log(">> Bot is running with REST API integration...");