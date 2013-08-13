using System.Web;
using System.Web.Optimization;

namespace AzurenRole
{
    public class BundleConfig
    {
        // For more information on Bundling, visit http://go.microsoft.com/fwlink/?LinkId=254725
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new ScriptBundle("~/bundles/jquery").Include(
                        "~/Scripts/jquery-{version}.js"));

            bundles.Add(new ScriptBundle("~/bundles/jqueryui").Include(
                        "~/Scripts/jquery-ui-{version}.js"));

            bundles.Add(new ScriptBundle("~/bundles/jqueryval").Include(
                        "~/Scripts/jquery.unobtrusive*",
                        "~/Scripts/jquery.validate*"));

            bundles.Add(new ScriptBundle("~/bundles/bootstrap").Include(
                        "~/Scripts/bootstrap.js"
                ));

            bundles.Add(new ScriptBundle("~/bundles/backbone").Include("~/Scripts/underscore.js", "~/Scripts/backbone.js"));
            bundles.Add(new ScriptBundle("~/bundles/jquerysignalr").Include(
                        "~/Scripts/jquery.signalR-{version}.js"
                ));
            bundles.Add(new ScriptBundle("~/bundles/ueditor").Include(
                        "~/Scripts/ueditor/ueditor.config.js",
                        "~/Scripts/ueditor/ueditor.all.*"
                ));

            bundles.Add(new ScriptBundle("~/bundles/jsdesk").Include(
                "~/Scripts/jsdesk/js/jquery.scrollTo-*",
                "~/Scripts/jsdesk/js/jdesktop.js"
                ));

            // Use the development version of Modernizr to develop with and learn from. Then, when you're
            // ready for production, use the build tool at http://modernizr.com to pick only the tests you need.
            bundles.Add(new ScriptBundle("~/bundles/modernizr").Include(
                        "~/Scripts/modernizr-*"));

            bundles.Add(new StyleBundle("~/Content/css").Include("~/Content/site.css"));

            bundles.Add(new StyleBundle("~/Content/themes/base/css").Include(
                        "~/Content/themes/base/bootstrap*"
                        ));
            bundles.Add(new StyleBundle("~/Content/jqueryui").Include(
                "~/Content/themes/base/jquery-ui.css"
                ));

            bundles.Add(new StyleBundle("~/Content/jsdesk").Include(
                "~/Scripts/jsdesk/css/jdesktop.css",
                "~/Content/themes/base/jquery-ui.css"
                ));


        }
    }
}