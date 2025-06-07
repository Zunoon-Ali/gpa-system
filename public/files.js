

document.addEventListener('DOMContentLoaded', function () {

    async function nav() {
        try {

            const nav = await fetch('components/navbar.html');
            const navText = await nav.text();

            document.getElementById('header').innerHTML = navText;
        } catch (error) {
            console.error('Error loading navigation:', error);
        }

    }

    nav();

});