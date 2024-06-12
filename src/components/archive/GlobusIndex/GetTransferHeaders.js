// transferUtils.js
export const getTransferHeaders = (auth) => {
    return {
      Authorization: `Bearer ${auth.authorization?.tokens.transfer?.access_token}`,
    };
};
  