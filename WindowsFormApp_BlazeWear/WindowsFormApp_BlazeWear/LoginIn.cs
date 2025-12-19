using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Reflection.Emit;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using static System.Windows.Forms.LinkLabel;

namespace WindowsFormApp_BlazeWear
{
    public partial class LoginIn : Form
    {
        public LoginIn()
        {
            InitializeComponent();
        }

        //this is when you click the label sentence, it sents you to the SignUp form app
        //i decided to use .Hide and.Show for this appearence
        private void lblSignUpSent_Click(object sender, EventArgs e)
        {
            FormSignUp signUpForm = new FormSignUp();
            signUpForm.Show();
            this.Hide();
        }


        // for now we are not learning database, so i made random username and password-
        //just remember, username for now is admin and the password is 1234, of course i added 'mock' email too,
        private void btnLogin_Click(object sender, EventArgs e)
        {
            //for the username and password
            string usernameOrEmail = textBoxUsernameOrEmail.Text;
            string password = textBoxPassword.Text;

            //this is like the if check up for typing
            if ((usernameOrEmail.Equals("admin") || usernameOrEmail.Equals("admin@gmail.com")) && password == "1234")
            {
                MessageBox.Show("Welcome back, " + usernameOrEmail + "!", "Login Successful");
                this.Close();
            }
            else
            {
                MessageBox.Show("Invalid username or password!", "Error");
            }
        }

        //this is for going back to the main page or main form.
        //just click on the label sentence and you go back.
        private void GoBackToTheMain_button_Click(object sender, EventArgs e)
        {
            MainForm signUpForm = new MainForm();
            signUpForm.Show();
            this.Hide();
        }
    }
}
