using System.Linq;
using System.Web.Mvc;
using AzurenRole.Utils;

namespace AzurenRole.Controllers
{
    public class StoreController : Controller
    {
        private AzurenEntities db = GlobalData.dbContext;
        //
        // GET: /Store/

        public ActionResult Index()
        {
            return View(db.Apps.ToList());
        }

        public ActionResult View(int id = 0)
        {
            App app = db.Apps.SingleOrDefault(a => a.Id == id);
            if (app == null)
            {
                return HttpNotFound();
            }
            User user = GlobalData.user;
            App uApp = user.Apps.SingleOrDefault(a => a.Id == id);
            if (uApp == null)
            {
                ViewData["installed"] = false;
            }
            else
            {
                ViewData["installed"] = true;
            }
            return View(app);
        }

        [HttpPost]
        public ActionResult Install(int id)
        {
            User user = GlobalData.user;
            App uApp = user.Apps.SingleOrDefault(a => a.Id == id);
            App app = db.Apps.SingleOrDefault(a => a.Id == id);
            if (uApp == null && app != null)
            {
                user.Apps.Add(app);
                db.SaveChanges();
                return Json(new {code = 0, data=new{id=app.Id, name=app.Name, url=app.Url, icon=app.Icon, width=app.Width, height=app.Height}}, JsonRequestBehavior.AllowGet);
            }
            else
            {
                return Json(new {code = 1}, JsonRequestBehavior.AllowGet);
            }
        }
        [HttpPost]
        public ActionResult Uninstall(int id)
        {
            User user = GlobalData.user;
            App app = user.Apps.SingleOrDefault(a => a.Id == id);
            if (app != null)
            {
                user.Apps.Remove(app);
                db.SaveChanges();
                return Json(new { code = 0, data = new { Id = app.Id} }, JsonRequestBehavior.AllowGet);
            }
            else
            {
                return Json(new { code = 1 }, JsonRequestBehavior.AllowGet);
            }
        }
    }
}
