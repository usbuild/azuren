using System.Data;
using System.Linq;
using System.Web.Mvc;

namespace AzurenRole.Controllers
{
    public class AppController : Controller
    {
        private AzurenEntities db = new AzurenEntities();

        //
        // GET: /App/

        public ActionResult Index()
        {
            return View(db.Apps.ToList());
        }

        //
        // GET: /App/Details/5

        public ActionResult Details(int id = 0)
        {
            App app = db.Apps.Single(a => a.Id == id);
            if (app == null)
            {
                return HttpNotFound();
            }
            return View(app);
        }

        //
        // GET: /App/Create

        public ActionResult Create()
        {
            return View();
        }

        //
        // POST: /App/Create

        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Create(App app)
        {
            if (ModelState.IsValid)
            {
                db.Apps.AddObject(app);
                db.SaveChanges();
                return RedirectToAction("Index");
            }

            return View(app);
        }

        //
        // GET: /App/Edit/5

        public ActionResult Edit(int id = 0)
        {
            App app = db.Apps.Single(a => a.Id == id);
            if (app == null)
            {
                return HttpNotFound();
            }
            return View(app);
        }

        //
        // POST: /App/Edit/5

        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Edit(App app)
        {
            if (ModelState.IsValid)
            {
                db.Apps.Attach(app);
                db.ObjectStateManager.ChangeObjectState(app, EntityState.Modified);
                db.SaveChanges();
                return RedirectToAction("Index");
            }
            return View(app);
        }

        //
        // GET: /App/Delete/5

        public ActionResult Delete(int id = 0)
        {
            App app = db.Apps.Single(a => a.Id == id);
            if (app == null)
            {
                return HttpNotFound();
            }
            return View(app);
        }

        //
        // POST: /App/Delete/5

        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public ActionResult DeleteConfirmed(int id)
        {
            App app = db.Apps.Single(a => a.Id == id);
            db.Apps.DeleteObject(app);
            db.SaveChanges();
            return RedirectToAction("Index");
        }

        public ActionResult Test()
        {
            return View();
        }

        protected override void Dispose(bool disposing)
        {
            db.Dispose();
            base.Dispose(disposing);
        }
    }
}