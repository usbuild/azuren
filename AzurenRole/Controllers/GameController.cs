﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace AzurenRole.Controllers
{
    public class GameController : Controller
    {
        //
        // GET: /Game/

        public ActionResult MineSweeper()
        {
            return View();
        }

    }
}
