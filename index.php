<?php
/**
 * Plugin Name: Events Calender
 * Description: Embeds Events Calender Vite-built React app into WordPress using a shortcode.
 * Version: 1.0
 * Author: Saad ur Rehman
 */

function enqueue_vite_react_app() {
    $plugin_url = plugin_dir_url(__FILE__) . 'react-app/';

    // ✅ Replace with your actual Vite build filenames
    echo '<link rel="stylesheet" href="' . $plugin_url . 'assets/index-CorZplFi.css">';
    echo '<div id="root"></div>';
    echo '<script type="module" src="' . $plugin_url . 'assets/index-iAI9hWdb.js"></script>';
}

function render_react_app_shortcode() {
    ob_start();
    enqueue_vite_react_app();
    return ob_get_clean();
}

add_shortcode('react_app', 'render_react_app_shortcode');
