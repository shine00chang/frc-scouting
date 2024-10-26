/* Defines the name of a field and the type, as well as any other configurations relevant
 * A 'divider' type will create a divider in that order. It will not affect the forum
 */
export const fields = [
  { 
    name: "Auto",
    type: "divider" 
  },
  {
    name: "leave",
    label: "Leave Starting Zone",
    type: "bool",
    toggle_tag: "success"
  },
  { 
    name: "a-amp",
    label: "Auto Amp Scores",
    type: "number",
    min: 0,
    max: 6,
  },
  { 
    name: "a-speaker",
    label: "Auto Speaker Scores",
    type: "number",
    min: 0,
    max: 6,
  },
  { 
    name: "TeleOp",
    type: "divider" 
  },
  {
    name: "amp",
    label: "TeleOp Amp Scores",
    type: "number",
    min: 0,
    max: 10,
  },
  {
    name: "speaker",
    label: "TeleOp Speaker Scores",
    type: "number",
    min: 0,
    max: 30,
  },
  {
    name: "ground",
    label: "Ground Pickup",
    type: "bool",
    toggle_tag: "success",
  },
  {
    name: "source",
    label: "Source Pickup",
    type: "bool",
    toggle_tag: "success",
  },
  {
    name: "under",
    label: "Can Go Under Stage",
    type: "bool"
  },
  { 
    name: "Endgame",
    type: "divider" 
  },
  {
    name: "park",
    label: "Parked",
    type: "bool",
    toggle_tag: "success"
  },
  {
    name: "onstage",
    label: "Onstage",
    type: "bool",
    toggle_tag: "success"
  },
  {
    name: "harmony",
    label: "Harmony",
    type: "bool",
    toggle_tag: "success"
  },
  {
    name: "trap",
    label: "Trap",
    type: "bool",
    toggle_tag: "success"
  },
  { 
    name: "Miscellaneous",
    type: "divider" 
  },
  {
    name: "driver",
    label: "Driver Skill (higher is better)",
    type: "rating",
    stops: 3
  },
  {
    name: "def",
    label: "Defense Rating (higher is better)",
    type: "rating",
    stops: 4
  },
  {
    name: "speed",
    label: "Speed Rating (higher is better)",
    type: "rating",
    stops: 5
  },
  {
    name: "died",
    label: "Died and Cannot Move",
    type: "bool",
    toggle_tag: "error"
  },
  {
    name: "incapacitated",
    label: "Moves but Dysfunctional",
    type: "bool",
    toggle_tag: "error"
  },
  {
    name: "butterfingers",
    label: "Drops Notes (>2)",
    type: "bool",
    toggle_tag: "error"
  },
  { type: "divider" },
  {
    name: "comment",
    label: "Comments",
    type: "text",
    max: 200,
  }
];

export const eventCode = '2024cacc';

/* Returns an object containing the field keys but with undefined value.
 */
export const emptyForum = () => {

  const o = {};

  for (const { type, name } of fields) {
    if (type == 'number') 
      o[name] = 0;
    if (type == 'bool') 
      o[name] = false;
    if (type == 'text') 
      o[name] = '';
    if (type == 'rating')
      o[name] = 1;
  }

  return {
    scout: "",
    team: 0,
    teamName: "",
    data: o
  };
}

/* Returns an array of field names, in the intended order.
 */
export const orderedFields = () => {
  const v = [];

  for (const { name, type } of fields) {
    if (type == 'divider') 
      continue;
    v.push(name);
  } 

  return v;
}

/* Given the forum, return the forum in CSV format
 */
export const makeQR = forum => {
  if (!validate(forum).ok) {
    console.error("makeQR() got invalid forum");
    return "invalid forum";
  }

  let o = forum.scout + ',' +  forum.team + ',' + forum.teamName;
  
  for (const field of orderedFields()) {
    if (typeof forum.data[field] === 'boolean') {
      o += ',' + (0 + forum.data[field]);
    } else {
      o += ',' + forum.data[field];
    }
  }
  
  return o;
}

/* Given the string extracted from the QR code, parses and constructs a forum object
 */
export const parseQR = forumCSV => {
  const forum = emptyForum();
  const v = forumCSV.trim().split(',');

  forum.scout = v[0];
  forum.team = Number(v[1]);
  forum.teamName = v[2];

  for (const [i, field] of orderedFields().entries()) {
    if (typeof forum.data[field] === 'boolean') 
      forum.data[field] = v[i+3] == '1';
    else if (typeof forum.data[field] === 'number') 
      forum.data[field] = Number(v[i+3]);
    else if (typeof forum.data[field] === 'string') 
      forum.data[field] = v[i+3];
    else 
      console.error('parseQR(): unexpected type in forum');
  }

  return forum;
}

/* Makes sure the forum is filled correctly
 * - msg specifies the reason for the invalidation.
 * @return { ok: bool, msg: string | undefined }
 */
export const validate = (forum) => {
  if (!forum) 
    return { ok: false, msg: `forum undefined` };

  // Fixed fields (scout initials, team number, comments)
  if (typeof forum.team !== 'number') 
    return { ok: false, msg: `'team' is not a number, got ${forum.team}` };
  if (typeof forum.scout !== 'string') 
    return { ok: false, msg: `'scout' is not a text, got ${forum.scout}` };
  if (forum.scout.length !== 2)
    return { ok: false, msg: `'scout' is not 2 characters` };

  // Data fields
  for (const field of fields) {
    if (field.type === 'divider') continue;

    const v = forum.data[field.name];

    // If not defined or null
    if (v === null || v === undefined) 
      return { ok: false, msg: `field '${field.name}' undefined` };

    // Per-type validations
    if (field.type == 'bool') {
      if (typeof v != 'boolean') 
        return { ok: false, msg: `field '${field.name}' is not a boolean, got ${v}` };
    }

    if (field.type == 'rating') {
      if (typeof v != 'number') 
        return { ok: false, msg: `field '${field.name}' is not a rating (number), got ${v}` };

      // number bounds
      if (v < 1 || v > field.stops)
        return { ok: false, msg: `field '${field.name}' (rating) is out of bounds [1, ${field.stops}], got ${v}` };
    }

    if (field.type == 'number') {
      if (typeof v != 'number') 
        return { ok: false, msg: `field '${field.name}' is not a number, got ${v}` };

      // number bounds
      if ((field.max && v > field.max) || (field.min && v < field.min))
        return { ok: false, msg: `field '${field.name}' is out of bounds [${field.min}, ${field.max}], got ${v}` };
    }

    // If text
    if (field.type == 'text') {
      if (typeof v != 'string') 
        return { ok: false, msg: `field '${field.name}' is not a string, got: ${v}` };

      if (v.length > field.max) 
        return { ok: false, msg: `field '${field.name}' exceeds character limit of ${field.max}` };
    }

    if (field.type == 'select') {
      if (typeof v != 'string') 
        return { ok: false, msg: `field '${field.name}' is not a string, got: ${v}` };

      if (!field.select_options.includes(v)) 
        return { ok: false, msg: `field '${field.name}'s value is not an option, got: ${v}` };
    }
  }

  return {
    ok: true,
  };
}


