const DataTypes = require("sequelize").DataTypes;
const _AccountPasswordResets = require("./accountPasswordResets");
const _Accounts = require("./accounts");
const _AdminWallet = require("./adminWallet");
const _Admins = require("./admins");
const _Cards = require("./cards");
const _Chats = require("./chats");
const _CustomPushes = require("./customPushes");
const _DispatcherPasswordResets = require("./dispatcherPasswordResets");
const _Dispatchers = require("./dispatchers");
const _Documents = require("./documents");
const _DriverDistance = require("./driverDistance");
const _Eventcontacts = require("./eventcontacts");
const _FavouriteLocations = require("./favouriteLocations");
const _FleetCards = require("./fleetCards");
const _FleetPasswordResets = require("./fleetPasswordResets");
const _FleetWallet = require("./fleetWallet");
const _Fleets = require("./fleets");
const _LtmTranslations = require("./ltmTranslations");
const _Migrations = require("./migrations");
const _NightFares = require("./nightFares");
const _OauthAccessTokens = require("./oauthAccessTokens");
const _OauthAuthCodes = require("./oauthAuthCodes");
const _OauthClients = require("./oauthClients");
const _OauthPersonalAccessClients = require("./oauthPersonalAccessClients");
const _OauthRefreshTokens = require("./oauthRefreshTokens");
const _PasswordResets = require("./passwordResets");
const _PoiConstants = require("./poiConstants");
const _PromocodePassbooks = require("./promocodePassbooks");
const _PromocodeUsages = require("./promocodeUsages");
const _Promocodes = require("./promocodes");
const _ProviderCards = require("./providerCards");
const _ProviderDevices = require("./providerDevices");
const _ProviderDocuments = require("./providerDocuments");
const _ProviderProfiles = require("./providerProfiles");
const _ProviderServices = require("./providerServices");
const _ProviderWallet = require("./providerWallet");
const _Providers = require("./providers");
const _RequestFilters = require("./requestFilters");
const _ServiceTypes = require("./serviceTypes");
const _Settings = require("./settings");
const _TimePrices = require("./timePrices");
const _Times = require("./times");
const _UserRequestPayments = require("./userRequestPayments");
const _UserRequestRatings = require("./userRequestRatings");
const _UserRequests = require("./userRequests");
const _UserWallet = require("./userWallet");
const _Users = require("./users");
const _WalletPassbooks = require("./walletPassbooks");
const _WalletRequests = require("./walletRequests");
const _Works = require("./works");

const _Notification = require("./notification");
const _NotificationMaster = require("./notificationMaster");
const _ProviderVouch = require("./providerVouch");
const _VouchTransaction = require("./vouchTransaction");
const _VouchDueAmounts = require("./vouchDueAmounts");
const _PaymentRequest = require("./paymentRequest");

function initModels(sequelize) {
  const AccountPasswordResets = _AccountPasswordResets(sequelize, DataTypes);
  const Accounts = _Accounts(sequelize, DataTypes);
  const AdminWallet = _AdminWallet(sequelize, DataTypes);
  const Admins = _Admins(sequelize, DataTypes);
  const Cards = _Cards(sequelize, DataTypes);
  const Chats = _Chats(sequelize, DataTypes);
  const CustomPushes = _CustomPushes(sequelize, DataTypes);
  const DispatcherPasswordResets = _DispatcherPasswordResets(
    sequelize,
    DataTypes
  );
  const Dispatchers = _Dispatchers(sequelize, DataTypes);
  const Documents = _Documents(sequelize, DataTypes);
  const DriverDistance = _DriverDistance(sequelize, DataTypes);
  const Eventcontacts = _Eventcontacts(sequelize, DataTypes);
  const FavouriteLocations = _FavouriteLocations(sequelize, DataTypes);
  const FleetCards = _FleetCards(sequelize, DataTypes);
  const FleetPasswordResets = _FleetPasswordResets(sequelize, DataTypes);
  const FleetWallet = _FleetWallet(sequelize, DataTypes);
  const Fleets = _Fleets(sequelize, DataTypes);
  const LtmTranslations = _LtmTranslations(sequelize, DataTypes);
  const Migrations = _Migrations(sequelize, DataTypes);
  const NightFares = _NightFares(sequelize, DataTypes);
  const OauthAccessTokens = _OauthAccessTokens(sequelize, DataTypes);
  const OauthAuthCodes = _OauthAuthCodes(sequelize, DataTypes);
  const OauthClients = _OauthClients(sequelize, DataTypes);
  const OauthPersonalAccessClients = _OauthPersonalAccessClients(
    sequelize,
    DataTypes
  );
  const OauthRefreshTokens = _OauthRefreshTokens(sequelize, DataTypes);
  const PasswordResets = _PasswordResets(sequelize, DataTypes);
  const PoiConstants = _PoiConstants(sequelize, DataTypes);
  const PromocodePassbooks = _PromocodePassbooks(sequelize, DataTypes);
  const PromocodeUsages = _PromocodeUsages(sequelize, DataTypes);
  const Promocodes = _Promocodes(sequelize, DataTypes);
  const ProviderCards = _ProviderCards(sequelize, DataTypes);
  const ProviderDevices = _ProviderDevices(sequelize, DataTypes);
  const ProviderDocuments = _ProviderDocuments(sequelize, DataTypes);
  const ProviderProfiles = _ProviderProfiles(sequelize, DataTypes);
  const ProviderServices = _ProviderServices(sequelize, DataTypes);
  const ProviderWallet = _ProviderWallet(sequelize, DataTypes);
  const Providers = _Providers(sequelize, DataTypes);
  const RequestFilters = _RequestFilters(sequelize, DataTypes);
  const ServiceTypes = _ServiceTypes(sequelize, DataTypes);
  const Settings = _Settings(sequelize, DataTypes);
  const TimePrices = _TimePrices(sequelize, DataTypes);
  const Times = _Times(sequelize, DataTypes);
  const UserRequestPayments = _UserRequestPayments(sequelize, DataTypes);
  const UserRequestRatings = _UserRequestRatings(sequelize, DataTypes);
  const UserRequests = _UserRequests(sequelize, DataTypes);
  const UserWallet = _UserWallet(sequelize, DataTypes);
  const Users = _Users(sequelize, DataTypes);
  const WalletPassbooks = _WalletPassbooks(sequelize, DataTypes);
  const WalletRequests = _WalletRequests(sequelize, DataTypes);
  const Works = _Works(sequelize, DataTypes);

  const Notification = _Notification(sequelize, DataTypes);
  const NotificationMaster = _NotificationMaster(sequelize, DataTypes);

  const ProviderVouch = _ProviderVouch(sequelize, DataTypes);
  const VouchTransaction = _VouchTransaction(sequelize, DataTypes);
  const VouchDueAmounts = _VouchDueAmounts(sequelize, DataTypes);
  const PaymentRequest = _PaymentRequest(sequelize, DataTypes);

  FleetWallet.belongsTo(Fleets, { as: "fleet", foreignKey: "fleet_id" });
  Fleets.hasMany(FleetWallet, { as: "fleet_wallets", foreignKey: "fleet_id" });
  UserRequestPayments.belongsTo(Fleets, {
    as: "Fleet",
    foreignKey: "fleet_id",
  });
  Fleets.hasMany(UserRequestPayments, {
    as: "user_request_payments",
    foreignKey: "fleet_id",
  });
  AdminWallet.belongsTo(LtmTranslations, {
    as: "transaction",
    foreignKey: "transaction_id",
  });
  LtmTranslations.hasMany(AdminWallet, {
    as: "admin_wallets",
    foreignKey: "transaction_id",
  });
  FleetWallet.belongsTo(LtmTranslations, {
    as: "transaction",
    foreignKey: "transaction_id",
  });
  LtmTranslations.hasMany(FleetWallet, {
    as: "fleet_wallets",
    foreignKey: "transaction_id",
  });
  ProviderWallet.belongsTo(LtmTranslations, {
    as: "transaction",
    foreignKey: "transaction_id",
  });
  LtmTranslations.hasMany(ProviderWallet, {
    as: "provider_wallets",
    foreignKey: "transaction_id",
  });
  OauthAccessTokens.belongsTo(OauthClients, {
    as: "client",
    foreignKey: "client_id",
  });
  OauthClients.hasMany(OauthAccessTokens, {
    as: "oauth_access_tokens",
    foreignKey: "client_id",
  });
  OauthAuthCodes.belongsTo(OauthClients, {
    as: "client",
    foreignKey: "client_id",
  });
  OauthClients.hasMany(OauthAuthCodes, {
    as: "oauth_auth_codes",
    foreignKey: "client_id",
  });
  OauthPersonalAccessClients.belongsTo(OauthClients, {
    as: "client",
    foreignKey: "client_id",
  });
  OauthClients.hasMany(OauthPersonalAccessClients, {
    as: "oauth_personal_access_clients",
    foreignKey: "client_id",
  });
  DriverDistance.belongsTo(PoiConstants, { as: "poi", foreignKey: "poiID" });
  PoiConstants.hasMany(DriverDistance, {
    as: "driver_distances",
    foreignKey: "poiID",
  });

  DriverDistance.belongsTo(ServiceTypes, {
    as: "service_types",
    foreignKey: "service_type_id",
  });
  ServiceTypes.hasMany(DriverDistance, {
    as: "driver_distances",
    foreignKey: "service_type_id",
  });

  DriverDistance.belongsTo(ProviderServices, {
    as: "provider_services",
    foreignKey: "provider_services_id",
  });
  ProviderServices.hasMany(DriverDistance, {
    as: "driver_distances",
    foreignKey: "provider_services_id",
  });
  PromocodePassbooks.belongsTo(Promocodes, {
    as: "promocode",
    foreignKey: "promocode_id",
  });
  Promocodes.hasMany(PromocodePassbooks, {
    as: "promocode_passbooks",
    foreignKey: "promocode_id",
  });
  PromocodeUsages.belongsTo(Promocodes, {
    as: "promocode",
    foreignKey: "promocode_id",
  });
  Promocodes.hasMany(PromocodeUsages, {
    as: "promocode_usages",
    foreignKey: "promocode_id",
  });
  UserRequestPayments.belongsTo(Promocodes, {
    as: "promocode",
    foreignKey: "promocode_id",
  });
  Promocodes.hasMany(UserRequestPayments, {
    as: "user_request_payments",
    foreignKey: "promocode_id",
  });
  UserRequests.belongsTo(Promocodes, {
    as: "promocode",
    foreignKey: "promocode_id",
  });
  Promocodes.hasMany(UserRequests, {
    as: "user_requests",
    foreignKey: "promocode_id",
  });
  Chats.belongsTo(Providers, { as: "provider", foreignKey: "provider_id" });
  Providers.hasMany(Chats, { as: "chats", foreignKey: "provider_id" });
  DriverDistance.belongsTo(Providers, {
    as: "rydo_db_v2_driver_distance2",
    foreignKey: "driverID",
  });
  Providers.hasMany(DriverDistance, {
    as: "driver_distances",
    foreignKey: "driverID",
  });
  ProviderDevices.belongsTo(Providers, {
    as: "provider",
    foreignKey: "provider_id",
  });
  Providers.hasMany(ProviderDevices, {
    as: "provider_devices",
    foreignKey: "provider_id",
  });
  ProviderDocuments.belongsTo(Providers, {
    as: "provider",
    foreignKey: "provider_id",
  });
  Providers.hasMany(ProviderDocuments, {
    as: "provider_documents",
    foreignKey: "provider_id",
  });

  //for ProviderDocuments Table updated mappings
  ProviderDocuments.belongsTo(Documents, {
    as: "document_details",
    foreignKey: "document_id",
  });
  Documents.hasMany(ProviderDocuments, {
    as: "provider_documents",
    foreignKey: "document_id",
  });

  Notification.belongsTo(NotificationMaster, {
    as: "notification_master",
    foreignKey: "notification_type_id",
  });

  NotificationMaster.hasMany(Notification, {
    as: "notification",
    foreignKey: "notification_type_id",
  });

  ProviderProfiles.belongsTo(Providers, {
    as: "provider",
    foreignKey: "provider_id",
  });
  Providers.hasMany(ProviderProfiles, {
    as: "provider_profiles",
    foreignKey: "provider_id",
  });
  ProviderServices.belongsTo(Providers, {
    as: "provider",
    foreignKey: "provider_id",
  });
  Providers.hasMany(ProviderServices, {
    as: "provider_services",
    foreignKey: "provider_id",
  });

  Notification.belongsTo(UserRequests, {
    as: "ride_notifications",
    foreignKey: "user_request_id",
  });

  ProviderWallet.belongsTo(Providers, {
    as: "provider",
    foreignKey: "provider_id",
  });
  Providers.hasMany(ProviderWallet, {
    as: "provider_wallets",
    foreignKey: "provider_id",
  });
  RequestFilters.belongsTo(Providers, {
    as: "provider",
    foreignKey: "provider_id",
  });
  Providers.hasMany(RequestFilters, {
    as: "request_filters",
    foreignKey: "provider_id",
  });
  UserRequestPayments.belongsTo(Providers, {
    as: "provider",
    foreignKey: "provider_id",
  });
  Providers.hasMany(UserRequestPayments, {
    as: "user_request_payments",
    foreignKey: "provider_id",
  });
  UserRequestRatings.belongsTo(Providers, {
    as: "provider",
    foreignKey: "provider_id",
  });
  Providers.hasMany(UserRequestRatings, {
    as: "user_request_ratings",
    foreignKey: "provider_id",
  });
  UserRequests.belongsTo(Providers, {
    as: "provider",
    foreignKey: "provider_id",
  });
  Providers.hasMany(UserRequests, {
    as: "user_requests",
    foreignKey: "provider_id",
  });
  UserRequests.belongsTo(Providers, {
    as: "current_provider",
    foreignKey: "current_provider_id",
  });
  Providers.hasMany(UserRequests, {
    as: "current_provider_user_requests",
    foreignKey: "current_provider_id",
  });
  ProviderServices.belongsTo(ServiceTypes, {
    as: "service_type",
    foreignKey: "service_type_id",
  });
  ServiceTypes.hasMany(ProviderServices, {
    as: "provider_services",
    foreignKey: "service_type_id",
  });
  TimePrices.belongsTo(ServiceTypes, {
    as: "service",
    foreignKey: "service_id",
  });
  ServiceTypes.hasMany(TimePrices, {
    as: "time_prices",
    foreignKey: "service_id",
  });
  UserRequests.belongsTo(ServiceTypes, {
    as: "service_type",
    foreignKey: "service_type_id",
  });
  ServiceTypes.hasMany(UserRequests, {
    as: "user_requests",
    foreignKey: "service_type_id",
  });
  TimePrices.belongsTo(Times, { as: "time", foreignKey: "time_id" });
  Times.hasMany(TimePrices, { as: "time_prices", foreignKey: "time_id" });
  Chats.belongsTo(UserRequests, { as: "request", foreignKey: "request_id" });
  UserRequests.hasMany(Chats, { as: "chats", foreignKey: "request_id" });
  RequestFilters.belongsTo(UserRequests, {
    as: "request",
    foreignKey: "request_id",
  });
  UserRequests.hasMany(RequestFilters, {
    as: "request_filters",
    foreignKey: "request_id",
  });
  UserRequestPayments.belongsTo(UserRequests, {
    as: "request",
    foreignKey: "request_id",
  });
  UserRequests.hasMany(UserRequestPayments, {
    as: "user_request_payments",
    foreignKey: "request_id",
  });
  UserRequestRatings.belongsTo(UserRequests, {
    as: "request",
    foreignKey: "request_id",
  });
  UserRequests.hasMany(UserRequestRatings, {
    as: "user_request_ratings",
    foreignKey: "request_id",
  });
  Cards.belongsTo(Users, { as: "user", foreignKey: "user_id" });
  Users.hasMany(Cards, { as: "cards", foreignKey: "user_id" });
  Chats.belongsTo(Users, { as: "user", foreignKey: "user_id" });
  Users.hasMany(Chats, { as: "chats", foreignKey: "user_id" });
  FavouriteLocations.belongsTo(Users, { as: "user", foreignKey: "user_id" });
  Users.hasMany(FavouriteLocations, {
    as: "favourite_locations",
    foreignKey: "user_id",
  });
  FleetCards.belongsTo(Users, { as: "user", foreignKey: "user_id" });
  Users.hasMany(FleetCards, { as: "fleet_cards", foreignKey: "user_id" });
  OauthAccessTokens.belongsTo(Users, { as: "user", foreignKey: "user_id" });
  Users.hasMany(OauthAccessTokens, {
    as: "oauth_access_tokens",
    foreignKey: "user_id",
  });
  OauthAuthCodes.belongsTo(Users, { as: "user", foreignKey: "user_id" });
  Users.hasMany(OauthAuthCodes, {
    as: "oauth_auth_codes",
    foreignKey: "user_id",
  });
  OauthClients.belongsTo(Users, { as: "user", foreignKey: "user_id" });
  Users.hasMany(OauthClients, { as: "oauth_clients", foreignKey: "user_id" });
  PromocodePassbooks.belongsTo(Users, { as: "user", foreignKey: "user_id" });
  Users.hasMany(PromocodePassbooks, {
    as: "promocode_passbooks",
    foreignKey: "user_id",
  });
  PromocodeUsages.belongsTo(Users, { as: "user", foreignKey: "user_id" });
  Users.hasMany(PromocodeUsages, {
    as: "promocode_usages",
    foreignKey: "user_id",
  });
  ProviderCards.belongsTo(Users, { as: "user", foreignKey: "user_id" });
  Users.hasMany(ProviderCards, { as: "provider_cards", foreignKey: "user_id" });
  UserRequestPayments.belongsTo(Users, { as: "user", foreignKey: "user_id" });
  Users.hasMany(UserRequestPayments, {
    as: "user_request_payments",
    foreignKey: "user_id",
  });
  UserRequestRatings.belongsTo(Users, { as: "user", foreignKey: "user_id" });
  Users.hasMany(UserRequestRatings, {
    as: "user_request_ratings",
    foreignKey: "user_id",
  });
  UserRequests.belongsTo(Users, { as: "user", foreignKey: "user_id" });
  Users.hasMany(UserRequests, { as: "user_requests", foreignKey: "user_id" });
  UserWallet.belongsTo(Users, { as: "user", foreignKey: "user_id" });
  Users.hasMany(UserWallet, { as: "user_wallets", foreignKey: "user_id" });
  WalletPassbooks.belongsTo(Users, { as: "user", foreignKey: "user_id" });
  Users.hasMany(WalletPassbooks, {
    as: "wallet_passbooks",
    foreignKey: "user_id",
  });
  ProviderVouch.belongsTo(Providers, {
    as: "provider",
    foreignKey: "provider_id",
  });
  Providers.hasMany(ProviderVouch, {
    as: "provider_vouch",
    foreignKey: "provider_id",
  });

  VouchDueAmounts.belongsTo(Providers, {
    as: "provider",
    foreignKey: "provider_id",
  });
  Providers.hasMany(VouchDueAmounts, {
    as: "vouch_due",
    foreignKey: "provider_id",
  });

  Providers.hasMany(PaymentRequest, {
    as: "payment_request",
    foreignKey: "provider_id",
  });

  PaymentRequest.belongsTo(Providers, {
    as: "provider",
    foreignKey: "provider_id",
  });

  VouchTransaction.belongsTo(Providers, {
    as: "provider",
    foreignKey: "provider_id",
  });
  Providers.hasMany(VouchTransaction, {
    as: "vouch_transaction",
    foreignKey: "provider_id",
  });

  return {
    AccountPasswordResets,
    Accounts,
    AdminWallet,
    Admins,
    Cards,
    Chats,
    CustomPushes,
    DispatcherPasswordResets,
    Dispatchers,
    Documents,
    DriverDistance,
    Eventcontacts,
    FavouriteLocations,
    FleetCards,
    FleetPasswordResets,
    FleetWallet,
    Fleets,
    LtmTranslations,
    Migrations,
    NightFares,
    OauthAccessTokens,
    OauthAuthCodes,
    OauthClients,
    OauthPersonalAccessClients,
    OauthRefreshTokens,
    PasswordResets,
    PoiConstants,
    PromocodePassbooks,
    PromocodeUsages,
    Promocodes,
    ProviderCards,
    ProviderDevices,
    ProviderDocuments,
    ProviderProfiles,
    ProviderServices,
    ProviderWallet,
    Providers,
    RequestFilters,
    ServiceTypes,
    Settings,
    TimePrices,
    Times,
    UserRequestPayments,
    UserRequestRatings,
    UserRequests,
    UserWallet,
    Users,
    WalletPassbooks,
    WalletRequests,
    Works,
    Notification,
    NotificationMaster,
    ProviderVouch,
    VouchTransaction,
    VouchDueAmounts,
    PaymentRequest,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
