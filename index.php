<?php
/**
 * Plugin Name: Events Calender
 * Description: Embeds Events Calender Vite-built React app into WordPress using a shortcode.
 * Version: 1.2.233300
 * Author: Saad ur Rehman
 */

 function enqueue_scripts() {

    wp_enqueue_script('custom-js', $plugin_url . 'assets/custom_js.js', null, '6.1.8');

    wp_localize_script('custom-js', 'ar_event_calendar_data', array(
        'root_url' => get_site_url(),
        'ajax_nonce' => wp_create_nonce('wp_normal_ajax_nonce'),
        'rest_nonce' => wp_create_nonce( 'wp_rest' )
    ));
}

function enqueue_vite_react_app() {
    $plugin_url = plugin_dir_url(__FILE__) . 'react-app/';

    // ✅ Replace with your actual Vite build filenames
    echo '<link rel="stylesheet" href="' . $plugin_url . 'assets/index-CPdGHBOz.css">';
    echo '<div id="root"></div>';
    echo '<script type="module" src="' . $plugin_url . 'assets/index-DUhWBbxi.js"></script>';

    enqueue_scripts();
}

function render_react_app_shortcode() {
    ob_start();
    enqueue_vite_react_app();
    return ob_get_clean();
}



add_shortcode('react_app', 'render_react_app_shortcode');