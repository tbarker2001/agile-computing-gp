import React, { useState } from "react";

const Editabletitle = ({
  text,
  type,
  placeholder,
  children,
  loggedin,
  isadmin,
  ...props
}) => {

  const [isEditing, setEditing] = useState(false);

  const handleKeyDown = (event, type) => {
    // Handle when key is pressed
  };


  return (
    <section {...props}>
      {isEditing ? (
        <div
          onBlur={() => setEditing(false)}
          onKeyDown={e => handleKeyDown(e, type)}
        >
          {children}
        </div>
      ) : (
        <div
          onClick={(loggedin == "true"&&isadmin=="true") ? () => setEditing(true):()=>setEditing(false)}
        >
          <span>
            {text || placeholder || "Title"}
          </span>
        </div>
      )}
    </section>
  );
};

export default Editabletitle;