//toggle_hook.js
//simple true-false state hook that has an initial state and flips on change call
//
//Coder: lhuan130

import { useState } from 'react';

//Toggle hook for swappable items on list
const useToggle = (initial = false) => {
  const [toggleValue, setToggleValue] = useState(initial);
  const toggler = () => {
    setToggleValue(!toggleValue);
  };
  return [toggleValue, toggler];
};

export default useToggle;