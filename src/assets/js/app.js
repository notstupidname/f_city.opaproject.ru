(function () {
    "use strict"

    const body = document.querySelector('body');
    const toTop = document.querySelector('.top');



    // Loading animation
    window.addEventListener('load', function () {
        //TEST timeout
        // Android Chrome bugs without this delay
        // window.setTimeout(function () {
        // body.classList.remove('is-loading');
        // }, 5);
        // body.classList.remove('transition');
        // if (document.querySelector(".carousel")) {
        //     Carousel();
        // }
    });


    // Back to top
    if (toTop) {
        toTop.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            body.scrollIntoView(true, { behavior: "smooth" });
        }, false);
    }


    // Close menu on navigational click
    const navAnchors = document.querySelectorAll('nav ul a');
    const menuToggle = document.querySelector('#menu-toggle');
    for (const anchor of navAnchors) {
        anchor.addEventListener('click', (e) => {
            menuToggle.checked = false;
        });
    }

    // Scrolling nav
    const navScroller = document.querySelector('nav .scroller');
    const navTabs = document.querySelectorAll('nav .nav-tab');
    navTabs.forEach(tab => {
        tab.addEventListener('click', function (e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            const newTab = navScroller.querySelector(href);
            // newTab.scrollIntoView({ block: 'nearest', inline: 'nearest' });
            navScroller.scrollTo({
                top: newTab.offsetTop - navScroller.offsetTop,
                behavior: 'smooth'
            });
            // Set current tab
            // Remove .current class from all tabs
            navTabs.forEach(t => t.classList.remove('current'));

            // Add .current to the clicked tab
            this.classList.add('current');
        })
    })

})();