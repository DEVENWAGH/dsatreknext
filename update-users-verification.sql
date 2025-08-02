-- Update existing users to be unverified (except OAuth users)
UPDATE users 
SET is_verified = false 
WHERE (password IS NOT NULL AND password != '') 
AND (is_verified IS NULL OR is_verified != true);

-- Keep OAuth users verified (they have empty passwords)
UPDATE users 
SET is_verified = true 
WHERE (password IS NULL OR password = '');