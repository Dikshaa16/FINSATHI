import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Phone, Calendar, Shield, Edit2, Save, X } from 'lucide-react';
import { useUser } from '../../Root';
import { api } from '../../../services/api';

export function ProfileScreen() {
  const { user, loading, refreshUser } = useUser();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    dateOfBirth: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneNumber: user.phoneNumber || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
      });
    }
  }, [user]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    setUploadingImage(true);
    
    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64String = reader.result as string;
          
          // Update profile with image
          const response = await api.updateUserProfile({
            profilePicture: base64String
          });
          
          if (response.data || !response.error) {
            await refreshUser();
            alert('Profile picture updated successfully!');
          } else {
            alert('Error: ' + (response.error || 'Failed to update profile picture'));
          }
        } catch (error) {
          console.error('Error uploading image:', error);
          alert('Failed to upload image');
        } finally {
          setUploadingImage(false);
          event.target.value = '';
        }
      };
      reader.onerror = () => {
        alert('Failed to read image file');
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await api.updateUserProfile(formData);
      
      if (response.data || !response.error) {
        await refreshUser();
        setEditing(false);
        alert('Profile updated successfully!');
      } else {
        alert('Error: ' + (response.error || 'Failed to update profile'));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneNumber: user.phoneNumber || '',
        dateOfBirth: user.dateOfBirth || '',
      });
    }
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div
            className="inline-block w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mb-4"
            style={{ borderColor: "#00D68F", borderTopColor: "transparent" }}
          />
          <p style={{ color: "rgba(255,255,255,0.6)" }}>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p style={{ color: "rgba(255,255,255,0.6)" }}>No user data available</p>
      </div>
    );
  }

  const fullName = `${user.firstName} ${user.lastName}`;
  const avatar = user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=00D68F&color=fff&size=256`;

  return (
    <div className="px-5 md:px-8 pt-5 md:pt-6 pb-8" style={{ color: "#fff" }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-2">Profile</h1>
        <p style={{ color: "rgba(255,255,255,0.5)" }}>
          Manage your account settings and preferences
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1"
        >
          <div
            className="rounded-3xl p-6 text-center"
            style={{
              background: "linear-gradient(145deg, #14141f 0%, #1a1a2e 100%)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            {/* Avatar */}
            <div className="relative inline-block mb-4">
              <img
                src={avatar}
                alt={fullName}
                className="w-32 h-32 rounded-2xl object-cover mx-auto"
                style={{ border: "3px solid rgba(0,214,143,0.3)" }}
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="avatar-upload"
              />
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all hover:scale-110"
                style={{
                  background: uploadingImage ? "#666" : "#00D68F",
                  border: "3px solid #14141f",
                }}
              >
                {uploadingImage ? (
                  <div
                    className="w-3 h-3 border-2 border-t-transparent rounded-full animate-spin"
                    style={{ borderColor: "#fff", borderTopColor: "transparent" }}
                  />
                ) : (
                  <Edit2 size={14} color="#0B0B0F" />
                )}
              </label>
            </div>

            {/* Name */}
            <h2 className="text-2xl font-bold mb-1">{fullName}</h2>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)" }}>
              {user.email}
            </p>

            {/* Stats */}
            <div
              className="grid grid-cols-2 gap-3 mt-6 pt-6"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
                  Member Since
                </p>
                <p style={{ fontSize: "14px", color: "#fff", fontWeight: 600 }}>
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
                </p>
              </div>
              <div>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
                  Status
                </p>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: "#00D68F" }}
                  />
                  <p style={{ fontSize: "14px", color: "#00D68F", fontWeight: 600 }}>
                    Active
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-2"
        >
          <div
            className="rounded-3xl p-6"
            style={{
              background: "#181820",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Personal Information</h3>
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all"
                  style={{
                    background: "rgba(0,214,143,0.1)",
                    color: "#00D68F",
                  }}
                >
                  <Edit2 size={16} />
                  <span>Edit</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      color: "rgba(255,255,255,0.6)",
                    }}
                  >
                    <X size={16} />
                    <span>Cancel</span>
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all"
                    style={{
                      background: "#00D68F",
                      color: "#0B0B0F",
                    }}
                  >
                    <Save size={16} />
                    <span>{saving ? 'Saving...' : 'Save'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* First Name */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                >
                  <div className="flex items-center gap-2">
                    <User size={14} />
                    <span>First Name</span>
                  </div>
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  disabled={!editing}
                  className="w-full px-4 py-3 rounded-xl outline-none transition-all"
                  style={{
                    background: editing ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#fff",
                  }}
                />
              </div>

              {/* Last Name */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                >
                  <div className="flex items-center gap-2">
                    <User size={14} />
                    <span>Last Name</span>
                  </div>
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  disabled={!editing}
                  className="w-full px-4 py-3 rounded-xl outline-none transition-all"
                  style={{
                    background: editing ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#fff",
                  }}
                />
              </div>

              {/* Email (Read-only) */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                >
                  <div className="flex items-center gap-2">
                    <Mail size={14} />
                    <span>Email</span>
                  </div>
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-4 py-3 rounded-xl outline-none"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    color: "rgba(255,255,255,0.4)",
                    cursor: "not-allowed",
                  }}
                />
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", marginTop: "4px" }}>
                  Email cannot be changed
                </p>
              </div>

              {/* Phone Number */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                >
                  <div className="flex items-center gap-2">
                    <Phone size={14} />
                    <span>Phone Number</span>
                  </div>
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  disabled={!editing}
                  className="w-full px-4 py-3 rounded-xl outline-none transition-all"
                  style={{
                    background: editing ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#fff",
                  }}
                  placeholder="+91 9876543210"
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                >
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    <span>Date of Birth</span>
                  </div>
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  disabled={!editing}
                  className="w-full px-4 py-3 rounded-xl outline-none transition-all"
                  style={{
                    background: editing ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#fff",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Security Card */}
          <div
            className="rounded-3xl p-6 mt-6"
            style={{
              background: "linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(124,58,237,0.04) 100%)",
              border: "1px solid rgba(124,58,237,0.18)",
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(124,58,237,0.2)" }}
              >
                <Shield size={20} color="#7C3AED" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Security</h3>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>
                  Manage your password and security settings
                </p>
              </div>
            </div>
            <button
              className="w-full py-3 rounded-xl font-medium transition-all mt-4"
              style={{
                background: "rgba(124,58,237,0.15)",
                color: "#7C3AED",
                border: "1px solid rgba(124,58,237,0.3)",
              }}
            >
              Change Password
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
