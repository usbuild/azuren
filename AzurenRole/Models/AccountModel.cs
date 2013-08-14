using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity;
using System.Globalization;
using System.Web.Mvc;
using System.Web.Security;
using System.Data.Objects;
using System.Configuration;

namespace AzurenRole.Models
{

    public class LoginForm
    {
        [Required]
        [Display(Name="User Name")]
        public string UserName { set; get; }

        [Required]
        [DataType(DataType.Password)]
        [Display(Name="Password")]
        public string Password { set; get; }
    }

    public class RegisterForm
    {
        [Required]
        [Display(Name = "User Name")]
        [StringLength(4)]
        public string UserName { set; get; }

        [Required]
        [Display(Name = "Display Name")]
        [StringLength(4)]
        public string DisplayName { set; get; }

        [Required]
        [Display(Name = "Password")]
        [StringLength(4)]
        public string Password { set; get; }

        [Required]
        [Display(Name = "Confirm Password")]
        [StringLength(4)]
        [System.Web.Mvc.Compare("Password")]
        public string ConfirmPassword { set; get; }
    }

    public class SettingForm
    {
        [Display(Name = "Display Name")]
        [StringLength(4)]
        public string DisplayName { set; get; }

        [Display(Name = "Old Password")]
        [StringLength(4)]
        public string OldPassword { set; get; }

        [Display(Name = "New Password")]
        [StringLength(4)]
        public string NewPassword { set; get; }

        [Display(Name = "Confirm Password")]
        [StringLength(4)]
        [System.Web.Mvc.Compare("NewPassword")]
        public string ConfirmPassword { set; get; }
    }

}