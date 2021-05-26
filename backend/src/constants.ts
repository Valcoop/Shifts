// Cookies
export const COOKIE_ACCESS_TOKEN_NAME = 'access_token';
export const COOKIE_USER_ID_NAME = 'user_id';

export const CORS_OPTION = {
  origin: true,
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

/** Nexcloud */
export const PLANNING_GROUP_NAME = process.env.PLANNING_GROUP_NAME;

export const OAUTH_TOKEN_PATH = '/apps/oauth2/api/v1/token';
export const OAUTH_AUTHORIZE_PATH = '/apps/oauth2/authorize';

export const NC_USER_PROVISIONING_URL = '/ocs/v1.php/cloud/users';
