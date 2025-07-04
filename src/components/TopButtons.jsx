// TopButtons.jsx
import React, { useState, useRef, useEffect } from "react";

export default function TopButtons({
  setBackgroundImage,
  activities,
  calendarCustomEvents,
  visibleFilters,
  setVisibleFilters,
  setVisibleEvents,
  categoryColors,
}) {
  const [showDropdown, setShowDropdown] = useState(false);

  // console.log("categoryColors:", categoryColors);

  const fileInputRef = useRef();
  const dropdownRef = useRef();

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
        !dropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <div className="top-bar">
      <button className="button-effect" onClick={handleChangeBgClick}>
        Change Background
      </button>

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
