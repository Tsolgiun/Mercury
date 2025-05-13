import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/use-auth';
import { usePost } from '../hooks/use-post';
import { useSocial } from '../hooks/use-social';
import FeedCard from '../components/feed/FeedCard';
import { Post } from '../context/PostContext';
import { getToast } from '../hooks/use-toast';
import { userApi } from '../lib/api';
import EditProfile from '../components/profile/EditProfile';
import { User } from '../context/AuthContext';
import { UserStats } from '../context/SocialContext';

interface UserProfile extends User {
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing: boolean;
}

const Profile: React.FC = () => {
  const { uid } = useParams<{ uid: string }>();
  const { currentUser } = useAuth();
  const { fetchPostsByUser } = usePost();
  const { followUser, unfollowUser, getUserStats } = useSocial();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'about'>('posts');
  const [showEditProfile, setShowEditProfile] = useState(false);
  
  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!uid || uid === 'undefined') {
        setError('Invalid user ID');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // MongoDB ObjectIDs are exactly 24 characters long and contain only hexadecimal characters
        const isMongoId = uid.length === 24 && /^[0-9a-f]+$/i.test(uid);
        
        // Fetch user data based on ID type
        const userData = isMongoId
          ? await userApi.getUserById(uid)
          : await userApi.getUserByFirebaseUid(uid);
        
        // Fetch user stats (followers, following, posts count)
        const userStats: UserStats = await getUserStats(uid);
        
        // Combine user data and stats
        const profileData: UserProfile = {
          ...userData,
          followersCount: userStats.followersCount,
          followingCount: userStats.followingCount,
          postsCount: userStats.postsCount,
          isFollowing: userStats.isFollowing
        };
        
        setProfile(profileData);
      } catch (error: any) {
        console.error('Error fetching profile:', error);
        setError(error.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [uid, getUserStats]);
  
  // Fetch user posts
  useEffect(() => {
    const loadPosts = async () => {
      if (!uid || uid === 'undefined' || !profile) return;
      
      try {
        setPostsLoading(true);
        setPosts([]); // Clear existing posts while loading
        const userPosts = await fetchPostsByUser(uid);
        setPosts(userPosts);
      } catch (error: any) {
        console.error('Error fetching user posts:', error);
      } finally {
        setPostsLoading(false);
      }
    };
    
    if (profile) {
      loadPosts();
    }
  }, [uid, profile, fetchPostsByUser]);
  
  // Handle follow/unfollow
  const handleFollowToggle = async () => {
    if (!currentUser) {
      getToast()?.showToast('Please log in to follow users', 'info');
      return;
    }
    
    if (!profile) return;
    
    try {
      if (profile.isFollowing) {
        await unfollowUser(profile._id);
        setProfile({
          ...profile,
          isFollowing: false,
          followersCount: profile.followersCount - 1
        });
        getToast()?.showToast(`Unfollowed ${profile.name}`, 'success');
      } else {
        await followUser(profile._id);
        setProfile({
          ...profile,
          isFollowing: true,
          followersCount: profile.followersCount + 1
        });
        getToast()?.showToast(`Following ${profile.name}`, 'success');
      }
    } catch (error: any) {
      console.error('Error toggling follow:', error);
      getToast()?.showToast(error.message || 'Failed to update follow status', 'error');
    }
  };
  
  if (loading) {
    return (
      <div className="container-narrow py-12">
        <div className="flex justify-center">
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }
  
  if (error || !profile) {
    return (
      <div className="container-narrow py-12">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-2xl font-bold mb-2">Profile Not Available</h2>
          <p className="text-red-500 mb-6">
            {error === 'Invalid user ID' 
              ? 'The profile URL appears to be invalid. Please check the URL and try again.'
              : error || 'This profile could not be found. It may have been deleted or is temporarily unavailable.'}
          </p>
          <div className="flex gap-4">
            <Link to="/" className="btn-outline">
              Go to Homepage
            </Link>
            <button 
              onClick={() => window.location.reload()} 
              className="btn"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  const isOwnProfile = currentUser && currentUser._id === profile._id;
  
  if (showEditProfile && isOwnProfile) {
    return (
      <div className="container-narrow py-8">
        <EditProfile onCancel={() => setShowEditProfile(false)} />
      </div>
    );
  }
  
  return (
    <div className="container-narrow py-8">
      {/* Profile header */}
      <div className="mb-8">
        <div className="flex items-center">
          {/* Avatar */}
          <div className="mr-6">
            {profile.avatar ? (
              <img 
                src={profile.avatar} 
                alt={profile.name} 
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-outline flex items-center justify-center text-2xl">
                {profile.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          {/* Profile info */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-1">{profile.name}</h1>
            {profile.username && (
              <p className="text-muted mb-2">@{profile.username}</p>
            )}
            
            <div className="flex items-center space-x-4 text-sm">
              <div>
                <span className="font-medium">{profile.followersCount}</span> followers
              </div>
              <div>
                <span className="font-medium">{profile.followingCount}</span> following
              </div>
              <div>
                <span className="font-medium">{profile.postsCount}</span> posts
              </div>
            </div>
          </div>
          
          {/* Action buttons */}
          <div>
            {isOwnProfile ? (
              <button 
                onClick={() => setShowEditProfile(true)} 
                className="btn-outline"
              >
                Edit Profile
              </button>
            ) : (
              <button 
                onClick={handleFollowToggle}
                className={profile.isFollowing ? 'btn-outline' : 'btn'}
              >
                {profile.isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>
        </div>
        
        {/* Bio */}
        {profile.bio && (
          <div className="mt-4">
            <p>{profile.bio}</p>
          </div>
        )}
      </div>
      
      {/* Tabs */}
      <div className="border-b border-outline mb-6">
        <div className="flex">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'posts'
                ? 'border-b-2 border-fg'
                : 'text-muted hover:text-fg'
            }`}
            onClick={() => setActiveTab('posts')}
          >
            Posts
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'about'
                ? 'border-b-2 border-fg'
                : 'text-muted hover:text-fg'
            }`}
            onClick={() => setActiveTab('about')}
          >
            About
          </button>
        </div>
      </div>
      
      {/* Tab content */}
      {activeTab === 'posts' ? (
        <div>
          {postsLoading ? (
            <div className="py-8 text-center">
              <p>Loading posts...</p>
            </div>
          ) : posts.length > 0 ? (
            <div className="space-y-6">
              {posts.map((post) => (
                <FeedCard key={post._id} post={post} />
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted">No posts yet.</p>
              {isOwnProfile && (
                <div className="mt-4">
                  <Link to="/editor" className="btn">
                    Create your first post
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="py-4">
          <h2 className="text-xl font-bold mb-4">About {profile.name}</h2>
          <p className="mb-4">
            {profile.bio || 'This user has not added a bio yet.'}
          </p>
          
          {/* Additional profile information */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-2">Profile Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex">
                <span className="text-muted w-32">Username:</span>
                <span>@{profile.username}</span>
              </div>
              {profile.createdAt && (
                <div className="flex">
                  <span className="text-muted w-32">Joined:</span>
                  <span>{new Date(profile.createdAt).toLocaleDateString()}</span>
                </div>
              )}
              <div className="flex">
                <span className="text-muted w-32">Posts:</span>
                <span>{profile.postsCount}</span>
              </div>
              <div className="flex">
                <span className="text-muted w-32">Followers:</span>
                <span>{profile.followersCount}</span>
              </div>
              <div className="flex">
                <span className="text-muted w-32">Following:</span>
                <span>{profile.followingCount}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
