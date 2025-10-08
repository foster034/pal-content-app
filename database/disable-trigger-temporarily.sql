-- Temporarily disable the trigger so we can handle profile creation in the API instead
-- This is a workaround until we can debug the trigger issue

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Note: After running this, the API will need to handle profile creation manually
-- The API code already has logic to update the profile, so we just need to modify it to INSERT instead

SELECT 'Trigger disabled. Profile creation will now be handled by the API.' AS result;
