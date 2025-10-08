/*!
=========================================================
* Meyawo Landing page
=========================================================

* Copyright: 2019 DevCRUD (https://devcrud.com)
* Licensed: (https://devcrud.com/licenses)
* Coded by www.devcrud.com

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// smooth scroll
$(document).ready(function(){
    $(".navbar .nav-link").on('click', function(event) {

        if (this.hash !== "") {

            event.preventDefault();

            var hash = this.hash;
            var targetOffset = $(hash).offset().top - 80; // Account for fixed navbar height

            $('html, body').animate({
                scrollTop: targetOffset
            }, 1200, 'swing', function(){
                window.location.hash = hash;
            });
        } 
    });

    // auto-close mobile menu on link click
    $('ul.nav .link').on('click', function(){
        if ($('ul.nav').hasClass('show')) {
            $('ul.nav').removeClass('show');
            $('#nav-toggle').removeClass('is-active');
        }
    });
});

// navbar toggle
$('#nav-toggle').click(function(){
    $(this).toggleClass('is-active')
    $('ul.nav').toggleClass('show');
});