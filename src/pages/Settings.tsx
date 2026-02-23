import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { settingsApi, type CompanySettings } from '@/services/api';
import { MapPin, Plus, Loader2, Trash2 } from 'lucide-react';

export default function Settings() {
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [address, setAddress] = useState('');
  const [locations, setLocations] = useState<CompanySettings[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchLocations = () => {
    settingsApi
      .getAll()
      .then((data) => setLocations(data))
      .catch(() => setLocations([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleAdd = async () => {
    if (!latitude || !longitude || !address) {
      toast({ title: 'Validation Error', description: 'All fields are required.', variant: 'destructive' });
      return;
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      toast({ title: 'Invalid Latitude', description: 'Latitude must be between -90 and 90.', variant: 'destructive' });
      return;
    }
    if (isNaN(lng) || lng < -180 || lng > 180) {
      toast({ title: 'Invalid Longitude', description: 'Longitude must be between -180 and 180.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      await settingsApi.create({ latitude: lat, longitude: lng, address: address.trim() });
      toast({ title: 'Location Added', description: 'Office location added successfully.' });
      setLatitude('');
      setLongitude('');
      setAddress('');
      fetchLocations();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to add location.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await settingsApi.delete(id);
      toast({ title: 'Deleted', description: 'Office location removed.' });
      fetchLocations();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to delete.', variant: 'destructive' });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <PageHeader title="Settings" description="Configure office locations for attendance verification" />

      <div className="space-y-6 max-w-2xl">
        {/* Add New Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Add Office Location
            </CardTitle>
            <CardDescription>
              Add office coordinates. Employee attendance will be verified against these locations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    placeholder="e.g. 28.6139"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    placeholder="e.g. 77.2090"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Office Address</Label>
                <Input
                  id="address"
                  placeholder="e.g. 123 Main Street, New Delhi"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  maxLength={500}
                />
              </div>
              <Button onClick={handleAdd} disabled={saving} className="w-full sm:w-auto">
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Add Location
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Saved Locations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Saved Locations
            </CardTitle>
            <CardDescription>
              {locations.length} office location{locations.length !== 1 ? 's' : ''} configured
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : locations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No locations added yet.</p>
            ) : (
              <div className="space-y-3">
                {locations.map((loc) => (
                  <div
                    key={loc.id}
                    className="flex items-start justify-between gap-4 p-4 rounded-lg border bg-muted/30"
                  >
                    <div className="space-y-1 min-w-0">
                      <p className="font-medium text-sm truncate">{loc.address}</p>
                      <p className="text-xs text-muted-foreground">
                        Lat: {loc.latitude}, Lng: {loc.longitude}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive shrink-0"
                      onClick={() => handleDelete(loc.id!)}
                      disabled={deletingId === loc.id}
                    >
                      {deletingId === loc.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
