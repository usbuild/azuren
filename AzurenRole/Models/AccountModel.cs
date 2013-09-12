using System.ComponentModel.DataAnnotations;

namespace AzurenRole.Models
{

    public class LoginForm
    {
        [Required]
        [Display(Name="Email or Username")]
        public string EmailOrUserName { set; get; }

        [Required]
        [DataType(DataType.Password)]
        [Display(Name="Password")]
        public string Password { set; get; }
    }

    public class RegisterForm
    {
        [Required]
        [Display(Name = "User Name")]
        [RegularExpression(@"^[\w-]{4,}", ErrorMessage = "UserName must be at least 4 letters and numbers")]
        public string UserName { set; get; }

        [Required]
        [Display(Name = "Email")]
        [EmailAddress]
        public string Email { set; get; }

        [Required]
        [Display(Name = "Password")]
        [StringLength(int.MaxValue, MinimumLength = 4)]
        public string Password { set; get; }

        [Required]
        [Display(Name = "Confirm Password")]
        [StringLength(int.MaxValue, MinimumLength = 4)]
        [System.Web.Mvc.Compare("Password")]
        public string ConfirmPassword { set; get; }
    }

    public class SettingForm
    {


        [Display(Name = "Old Password")]
        [StringLength(int.MaxValue, MinimumLength = 4)]
        public string OldPassword { set; get; }

        [Display(Name = "New Password")]
        [StringLength(int.MaxValue, MinimumLength = 4)]
        public string NewPassword { set; get; }

        [Display(Name = "Confirm Password")]
        [StringLength(int.MaxValue, MinimumLength = 4)]
        [System.Web.Mvc.Compare("NewPassword")]
        public string ConfirmPassword { set; get; }
    }

}