using System;
using System.Linq;
using System.Net.Mime;
using System.Web.WebPages;
using DotNetOpenAuth.OAuth2;

namespace AzurenRole.OAuth
{
    public class ClientDescription : IClientDescription
    {
        private readonly AzurenEntities _entities = new AzurenEntities();
        private readonly OApp _client;

        public ClientDescription(OApp client)
        {
            _client = client;
        }
        public bool IsCallbackAllowed(Uri callback)
        {
            return callback.ToString() == _client.RedirectUri;
        }

        public bool IsValidClientSecret(string secret)
        {
            return secret == _client.Secret;
        }

        public Uri DefaultCallback
        {
            get
            {
                return _client != null ? new Uri(_client.RedirectUri) : null;
            }
        }

        public ClientType ClientType
        {
            get
            {
                if (_client.Type == "confidential")
                {
                    return ClientType.Confidential;
                }
                else
                {
                    return ClientType.Public;
                }
            }
        }

        public bool HasNonEmptySecret
        {
            get
            {
                return !_client.Secret.IsEmpty();
            }
        }
    }
}