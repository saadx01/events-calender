import React, { useState, useRef, useEffect } from "react";

export default function TopButtons({
  setBackgroundImage,
  activities,
  calendarCustomEvents,
  visibleFilters,
  setVisibleFilters,
  setVisibleEvents,
  categoryColors,
  fontSize,
  setFontSize, // ✅ Added prop for font size state
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showFontSlider, setShowFontSlider] = useState(false); // ✅ State for font slider popover

  const fileInputRef = useRef();
  const dropdownRef = useRef();
  const sliderRef = useRef();

  const uniqueCategories = Array.from(
    new Set(calendarCustomEvents.map((e) => e.category))
  );

  const handleChangeBgClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !window.ar_event_calendar_data) return;

    const formData = new FormData();
    formData.append("async-upload", file);
    formData.append("nonce", ar_event_calendar_data.rest_nonce);
    formData.append("compressState", "calendar_bg");

    try {
      const res = await fetch(
        `${ar_event_calendar_data.root_url}/wp-json/activities/v1/upload-bg`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      if (data?.path) {
        setBackgroundImage(data.path);
      }
    } catch (err) {
      console.error("Theme upload failed:", err);
    }
  };

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  const toggleFontSlider = () => {
    setShowFontSlider((prev) => !prev);
  };

  const handleCheckboxChange = (key) => {
    setVisibleFilters((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  useEffect(() => {
    const filteredEvents = [];

    if (visibleFilters.monthly) {
      filteredEvents.push(...activities);
    }

    uniqueCategories.forEach((category) => {
      if (visibleFilters[category]) {
        const catEvents = calendarCustomEvents.filter(
          (ev) => ev.category === category
        );
        filteredEvents.push(...catEvents);
      }
    });

    setVisibleEvents(filteredEvents);
  }, [visibleFilters, activities, calendarCustomEvents, setVisibleEvents]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        sliderRef.current &&
        !sliderRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
        setShowFontSlider(false);
      }
    };

    if (showDropdown || showFontSlider) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown, showFontSlider]);

  return (
    <div className="top-bar">
      {/* 1. Change Background */}
      <button className="button-effect" onClick={handleChangeBgClick}>
        Change Background
      </button>

      {/* 2. Filter Dropdown */}
      <div className="filter-dropdown-wrapper" ref={dropdownRef}>
        <button className="button-effect" onClick={toggleDropdown}>
          Filter Activities
        </button>

        {showDropdown && (
          <div className="filter-dropdown">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={visibleFilters.monthly || false}
                onChange={() => handleCheckboxChange("monthly")}
              />
              <span style={{ color: categoryColors?.monthly || "black" }}>
                Monthly Activities
              </span>
            </label>

            {uniqueCategories.map((category) => (
              <label className="checkbox-label" key={category}>
                <input
                  type="checkbox"
                  checked={visibleFilters[category] || false}
                  onChange={() => handleCheckboxChange(category)}
                />
                <span style={{ color: categoryColors?.[category] || "black" }}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="font-slider-wrapper">
          <label className="slider-label">
            Font Size: <span>{fontSize}</span>
          </label>
        <input
          type="range"
          min="10"
          max="30"
          step="1"
          value={fontSize}
          onChange={(e) => setFontSize(parseInt(e.target.value))}
          className="styled-slider"
        />
      </div>

      {/* 3. Font Size Slider */}
      {/* <div className="font-slider-wrapper" ref={sliderRef}>
        <button className="button-effect" onClick={toggleFontSlider}>
          Font Size
        </button>

        {showFontSlider && (
          <div className="font-slider-popover">
            <p className="slider-label">Font Size: {fontSize}</p>
            <input
              type="range"
              min="10"
              max="30"
              step="1"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
            />
          </div>
        )}
      </div> */}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: "none" }}
      />
    </div>
  );
}
