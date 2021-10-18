import { useState } from 'react';

export default function CatNames({ cats }) {
  const [nameFilter, setNameFilter] = useState('');
  const [skipTemporary, setSkipTemporary] = useState(false);

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
        return false; // always skip test cats
      }
      if (skipTemporary && name.match(/[0-9]/i)) {
        return false;
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
      <div className="flex">
        <div className="m-4 flex-1">
          <input
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="nameFilterInput"
            type="search"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value.trim())}
            placeholder="Type to search..."
          />
        </div>
        <div className="m-4 flex-1 self-center">
          <input
            id="skipTemporaryNames"
            type="checkbox"
            checked={skipTemporary}
            onChange={(e) => setSkipTemporary(e.target.checked)}
          />{' '}
          <label htmlFor="skipTemporaryNames">Skip temporary names</label>
        </div>
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
