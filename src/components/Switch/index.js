import React from 'react';
import PropTypes from 'prop-types';

import './Switch.scss';

const Switch = ({ checked, label, onChange }) => (
    <span className="switch">
        <input id={label} type="checkbox" className="uk-checkbox" checked={checked} onChange={onChange}/>
        <label htmlFor={label}>{label}</label>
    </span>
);

Switch.propTypes = {
    onChange: PropTypes.func.isRequired,
    checked: PropTypes.bool,
    label: PropTypes.string,
};

Switch.defaultProps = {
    checked: false,
    label: "Toggle" + Date.now(),
};

export default Switch;