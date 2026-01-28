import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Upload, X, Search } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AlertBanner } from '@/components/security/AlertBanner';
import { UserCard } from '@/components/security/UserCard';
import { useSecurity } from '@/context/SecurityContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function AuthorizedUsers() {
  const { authorizedUsers, addAuthorizedUser, removeAuthorizedUser } = useSecurity();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserImage, setNewUserImage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddUser = () => {
    if (newUserName.trim() && newUserImage.trim()) {
      addAuthorizedUser({
        name: newUserName.trim(),
        imageUrl: newUserImage.trim(),
      });
      setNewUserName('');
      setNewUserImage('');
      setIsAddDialogOpen(false);
    }
  };

  const filteredUsers = authorizedUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sampleImages = [
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&h=200&fit=crop&crop=face',
  ];

  return (
    <DashboardLayout>
      <AlertBanner />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              Authorized Users
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage who has access to your home
            </p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground glow-primary">
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-panel-elevated border-border">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Add Authorized User
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="Enter user's full name"
                    className="bg-muted/50 border-border"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="image">Profile Image URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="image"
                      value={newUserImage}
                      onChange={(e) => setNewUserImage(e.target.value)}
                      placeholder="https://example.com/photo.jpg"
                      className="bg-muted/50 border-border"
                    />
                    <Button variant="outline" size="icon">
                      <Upload className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Sample images */}
                <div className="space-y-2">
                  <Label>Or select a sample image</Label>
                  <div className="flex gap-2">
                    {sampleImages.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setNewUserImage(img)}
                        className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-colors ${
                          newUserImage === img ? 'border-primary' : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview */}
                {newUserImage && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <img
                      src={newUserImage}
                      alt="Preview"
                      className="w-12 h-12 rounded-full object-cover border border-border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100';
                      }}
                    />
                    <div>
                      <p className="font-medium">{newUserName || 'New User'}</p>
                      <p className="text-xs text-muted-foreground">Preview</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddUser}
                    disabled={!newUserName.trim() || !newUserImage.trim()}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    Add User
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <Card className="glass-panel border-border/50">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users..."
                className="pl-10 bg-muted/50 border-border"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredUsers.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onRemove={removeAuthorizedUser}
              />
            ))}
          </AnimatePresence>
        </div>

        {filteredUsers.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-lg font-medium text-muted-foreground">
              {searchQuery ? 'No users found' : 'No authorized users yet'}
            </p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              {searchQuery ? 'Try a different search term' : 'Add your first authorized user to get started'}
            </p>
          </motion.div>
        )}

        {/* Stats */}
        <Card className="glass-panel border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">User Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-muted/30">
                <p className="text-2xl font-bold text-primary">{authorizedUsers.length}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/30">
                <p className="text-2xl font-bold text-green-400">{authorizedUsers.length}</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/30">
                <p className="text-2xl font-bold text-foreground">
                  {authorizedUsers.length > 0 
                    ? new Date(Math.max(...authorizedUsers.map(u => u.addedAt.getTime()))).toLocaleDateString()
                    : '-'
                  }
                </p>
                <p className="text-sm text-muted-foreground">Last Added</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/30">
                <p className="text-2xl font-bold text-cyan-400">100%</p>
                <p className="text-sm text-muted-foreground">Verified</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
}
