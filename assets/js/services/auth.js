export const USER_STORAGE_KEY = 'prelovedu_user';
export const LEGACY_DEMO_USER_ID = 'usr-maba-01';
export const LEGACY_DEMO_USER_NAME = 'Zahra Putri';
export const LEGACY_DEMO_USER_AVATAR = 'ZP';

export const GUEST_USER = Object.freeze({
  id: 'guest',
  name: 'GUEST',
  faculty: '',
  email: '',
  isVerified: false,
  avatar: 'G',
  phone: '',
  isLoggedIn: false,
  role: 'guest'
});

function removeLegacyDemoUser() {
  try {
    const storedValue = localStorage.getItem(USER_STORAGE_KEY);

    if (storedValue === '') {
      localStorage.removeItem(USER_STORAGE_KEY);
      return;
    }

    if (!storedValue) return;

    const storedUser = JSON.parse(storedValue);
    const isLegacyDemoUser = storedUser?.id === LEGACY_DEMO_USER_ID || (
      storedUser?.name === LEGACY_DEMO_USER_NAME &&
      storedUser?.avatar === LEGACY_DEMO_USER_AVATAR
    );

    if (isLegacyDemoUser) {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  } catch {
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch {
      // LocalStorage may be unavailable in restricted browser contexts.
    }
  }
}

// This is display state only; browser storage never establishes an authenticated session.
export function getAuthUiState() {
  removeLegacyDemoUser();

  return {
    status: 'GUEST',
    isLoggedIn: false,
    user: GUEST_USER
  };
}
