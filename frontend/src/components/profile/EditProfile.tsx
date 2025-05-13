import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/use-auth';
import { getToast } from '../../hooks/use-toast';
import { uploadApi } from '../../lib/api';

interface EditProfileProps {
  onCancel: () => void;
}

const EditProfile: React.FC<EditProfileProps> = ({ onCancel }) => {
  const { currentUser, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    bio: '',
    avatar: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  
  // Initialize form with current user data
  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        username: currentUser.username || '',
        bio: currentUser.bio || '',
        avatar: currentUser.avatar || '',
      });
      
      if (currentUser.avatar) {
        setAvatarPreview(currentUser.avatar);
      }
    }
  }, [currentUser]);
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  // Handle avatar file selection
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!file.type.match('image.*')) {
        setErrors(prev => ({ ...prev, avatar: 'Please select an image file' }));
        return;
      }
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, avatar: 'Image must be less than 2MB' }));
        return;
      }
      
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setErrors(prev => ({ ...prev, avatar: '' }));
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }
    
    if (formData.bio && formData.bio.length > 160) {
      newErrors.bio = 'Bio must be 160 characters or less';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let avatarUrl = formData.avatar;
      
      // Upload new avatar if selected
      if (avatarFile) {
        avatarUrl = await uploadApi.uploadImage(avatarFile);
      }
      
      // Update user profile
      await updateUserProfile({
        ...formData,
        avatar: avatarUrl,
      });
      
      getToast()?.showToast('Profile updated successfully', 'success');
      
      // Navigate back to profile page
      if (currentUser) {
        navigate(`/profile/${currentUser._id}`);
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      
      // Handle specific errors
      if (error.response?.data?.message === 'Username already exists') {
        setErrors(prev => ({ ...prev, username: 'Username is already taken' }));
      } else {
        getToast()?.showToast(error.message || 'Failed to update profile', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-bg-alt p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-6">Edit Profile</h2>
      
      <form onSubmit={handleSubmit}>
        {/* Avatar */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Profile Picture</label>
          <div className="flex items-center">
            <div className="mr-4">
              {avatarPreview ? (
                <img 
                  src={avatarPreview} 
                  alt="Avatar preview" 
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-outline flex items-center justify-center text-xl">
                  {formData.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <input
                type="file"
                id="avatar"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <label 
                htmlFor="avatar"
                className="btn-outline text-sm py-1 px-3 cursor-pointer"
              >
                Change Photo
              </label>
              {errors.avatar && (
                <p className="text-red-500 text-xs mt-1">{errors.avatar}</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Name */}
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full p-2 border rounded-md bg-bg ${
              errors.name ? 'border-red-500' : 'border-outline'
            }`}
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
          )}
        </div>
        
        {/* Username */}
        <div className="mb-4">
          <label htmlFor="username" className="block text-sm font-medium mb-2">
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className={`w-full p-2 border rounded-md bg-bg ${
              errors.username ? 'border-red-500' : 'border-outline'
            }`}
          />
          {errors.username && (
            <p className="text-red-500 text-xs mt-1">{errors.username}</p>
          )}
        </div>
        
        {/* Bio */}
        <div className="mb-6">
          <label htmlFor="bio" className="block text-sm font-medium mb-2">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={3}
            className={`w-full p-2 border rounded-md bg-bg ${
              errors.bio ? 'border-red-500' : 'border-outline'
            }`}
            maxLength={160}
          />
          <div className="flex justify-between text-xs mt-1">
            <span className={errors.bio ? 'text-red-500' : 'text-muted'}>
              {errors.bio || ''}
            </span>
            <span className="text-muted">
              {formData.bio?.length || 0}/160
            </span>
          </div>
        </div>
        
        {/* Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="btn-outline"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;
