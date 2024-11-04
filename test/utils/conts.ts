const constants = {
  ALZR11_ID: '6715aa581c7a438580220700',
  HGLG11_ID: '6715aa601c7a438580220706',
  SNEL11_ID: '6715aa691c7a438580221ad1',
  KNCR11_ID: '6715aa771c7a438580221ad6',

  USERS: {
    JOHN_DOE: {
      ID: '67244e9962394e5466ae4f65',
      PASSWORD: 'secure-password',
      EMAIL: 'john@example.com',
    },
    JANE_DOE: {
      ID: '67259d317e62578812fce1aa',
      PASSWORD: 'secure-password',
      EMAIL: 'jane@example.com',
    },
  },
} as const;

export default constants;
