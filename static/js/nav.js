function nav_set_current_section(section_name) {
    let v = document.getElementsByClassName(`nav-section-${section_name}`)
    if (v.length) { v[0].checked = true }
}