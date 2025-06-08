-- Create storage bucket for profile pictures
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-pictures', 'profile-pictures', true);

-- Create policy to allow users to upload their own profile pictures
CREATE POLICY "Users can upload own profile picture" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create policy to allow users to update their own profile pictures
CREATE POLICY "Users can update own profile picture" ON storage.objects
  FOR UPDATE USING (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create policy to allow users to delete their own profile pictures
CREATE POLICY "Users can delete own profile picture" ON storage.objects
  FOR DELETE USING (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create policy to allow public access to profile pictures
CREATE POLICY "Profile pictures are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-pictures');
