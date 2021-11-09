import { useState } from 'react';

export default function CatNames({ cats }) {
  const [nameFilter, setNameFilter] = useState('');

  const uniqueNames = [...new Set(cats.map(({ Name }) => Name))];
  const lowercaseNameFilter = nameFilter.toLowerCase();

  const namesToRender = uniqueNames
    .map((name) => {
      return {
        name,
        lowercaseName: name.toLowerCase(),
      };
    })
    .filter(({ name, lowercaseName }) => {
      if (name.match(/test|training|practice/i)) {
        return false; // always skip test cats and temporary names
      }
      if (name.match(/ [A-R|T-Z]+[0-9]/i)) {
        return false; // skip intake names with tags like A1, K1 (but not S1 or SK1)
      }
      if (nameFilter && !lowercaseName.includes(lowercaseNameFilter)) {
        return false;
      }
      return true;
    })
    .sort((a, z) => {
      return a.lowercaseName.localeCompare(z.lowercaseName);
    });

  const columnStyle = namesToRender.length > 20 ? { columns: '16rem auto' } : undefined;

  return (
    <div className="p-4">
      <div className="m-4">
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="nameFilterInput"
          type="search"
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value.trim())}
          placeholder="Type to search..."
        />
      </div>
      <hr />
      {namesToRender.length > 0 ? (
        <ul className="m-4" style={columnStyle}>
          {namesToRender.map(({ name }) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      ) : (
        <p className="m-4">No cats!</p>
      )}
    </div>
  );
}
