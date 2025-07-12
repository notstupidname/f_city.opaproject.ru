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

    // Design mode for items
    document.addEventListener('keyup', (e) => {
        if (e.ctrlKey && e.key === ',') {
            console.log("design");
            body.classList.add('design');

            const nodesObject = {
                nodeA: null,
                nodeB: null
            }

            function swapNodes(a, b) {
                console.log(`Swapd ${a.innerText} for ${b.innerText}`);
                b.before(a);
            }

            const items = document.querySelectorAll('.items a');
            for (const item of items) {
                item.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (nodesObject.nodeA == null) {
                        nodesObject.nodeA = this;
                        nodesObject.nodeA.classList.add('checked-node');
                    } else if (nodesObject.nodeA == this) {
                        nodesObject.nodeA.classList.remove('checked-node');
                        nodesObject.nodeA = null;
                    } else {
                        nodesObject.nodeA.classList.remove('checked-node');
                        nodesObject.nodeA = this;
                        nodesObject.nodeA.classList.add('checked-node');
                    }
                });
            }

            document.addEventListener('keyup', (e) => {
                if (e.key == 'ArrowLeft') {
                    e.preventDefault();
                    if (nodesObject.nodeA) {
                        console.log('Ready for swap');
                        if (nodesObject.nodeA.previousElementSibling) {
                            nodesObject.nodeA.after(nodesObject.nodeA.previousElementSibling);
                        }
                    }
                }
                if (e.key == 'ArrowRight') {
                    e.preventDefault();
                    if (nodesObject.nodeA) {
                        console.log('Ready for swap');
                        if (nodesObject.nodeA.nextElementSibling) {
                            nodesObject.nodeA.before(nodesObject.nodeA.nextElementSibling);
                        }
                    }
                }
            });
        }
    }, { once: true });

})();