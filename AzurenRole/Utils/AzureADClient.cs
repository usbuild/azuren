using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using DotNetOpenAuth;
using DotNetOpenAuth.OAuth2;

namespace AzurenRole.Utils
{
    public class AzureADClient:WebServerClient
    {
        public AzureADClient(AuthorizationServerDescription authorizationServer, string clientIdentifier = null, string clientSecret = null, IHostFactories hostFactories = null) : base(authorizationServer, clientIdentifier, clientSecret, hostFactories)
        {
        }

        public AzureADClient(AuthorizationServerDescription authorizationServer, string clientIdentifier, ClientCredentialApplicator clientCredentialApplicator, IHostFactories hostFactories = null) : base(authorizationServer, clientIdentifier, clientCredentialApplicator, hostFactories)
        {
        }
    }
}