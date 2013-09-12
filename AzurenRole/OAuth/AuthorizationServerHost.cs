using System;
using System.Linq;
using System.Web.Security;
using DotNetOpenAuth.Messaging.Bindings;
using DotNetOpenAuth.OAuth2;
using DotNetOpenAuth.OAuth2.ChannelElements;
using DotNetOpenAuth.OAuth2.Messages;

namespace AzurenRole.OAuth
{
    public class AuthorizationServerHost : IAuthorizationServerHost
    {
        internal static readonly ICryptoKeyStore HardCodedCryptoKeyStore = new HardCodedKeyCryptoKeyStore("p7J2L24Qj4KGYUOr1fE4F0XAhqn6rZc5dx4nxvI22Kg=");
        private readonly AzurenEntities _entities = new AzurenEntities();
        public ICryptoKeyStore CryptoKeyStore
        {
            get
            {
                return HardCodedCryptoKeyStore;
            }
        }

        public AccessTokenResult CreateAccessToken(IAccessTokenRequest accessTokenRequestMessage)
        {

            var accessToken = new AuthorizationServerAccessToken
            {
                Lifetime = TimeSpan.FromDays(30),
                SymmetricKeyStore = this.CryptoKeyStore,
                ClientIdentifier = accessTokenRequestMessage.ClientIdentifier
            };
            return new AccessTokenResult(accessToken);
        }


        public IClientDescription GetClient(string clientIdentifier)
        {
            var client = _entities.OApps.SingleOrDefault(m => m.Id == clientIdentifier);
            if (client == null) throw new ArgumentException("identifier");
            return new ClientDescription(client);
        }

        public bool IsAuthorizationValid(IAuthorizationDescription authorization)
        {
            return true;
        }

        public AutomatedUserAuthorizationCheckResponse CheckAuthorizeResourceOwnerCredentialGrant(string userName, string password,
            IAccessTokenRequest accessRequest)
        {
            if (Membership.ValidateUser(userName, password))
            {
                return new AutomatedUserAuthorizationCheckResponse(accessRequest, true,
                    Membership.GetUser(userName).UserName);
            }
            else
            {
                return new AutomatedUserAuthorizationCheckResponse(accessRequest, false, null);
            }
        }

        public AutomatedAuthorizationCheckResponse CheckAuthorizeClientCredentialsGrant(IAccessTokenRequest accessRequest)
        {
            if (accessRequest.ClientAuthenticated)
            {
                throw new NotSupportedException();
            }
            else
            {
                return new AutomatedAuthorizationCheckResponse(accessRequest, false);
            }
        }



        public INonceStore NonceStore
        {
            get
            {
                return null;
            }
        }
    }
}