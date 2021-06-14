import Select from 'react-select';

export default function Searchbar({
  handleBreedChange,
  handleColorChange,
  handleAgeChange,
  handleSexChange,
  handleAttributeChange,
  handleNameChange,
}) {
  const breeds = [
    { value: 'Longhair', label: 'Longhair' },
    { value: 'Medium Hair', label: 'Medium Hair' },
    { value: 'Shorthair', label: 'Shorthair' },
    { value: 'Siamese', label: 'Siamese' },
  ];

  const colors = [
    { value: 'Calico', label: 'Calico' },
    { value: 'Black', label: 'Black' },
    { value: 'Brown', label: 'Brown' },
    { value: 'Grey', label: 'Grey' },
    { value: 'Tan', label: 'Tan' },
    { value: 'Tortoise', label: 'Tortoise' },
    { value: 'White', label: 'White' },
  ];

  const ages = [
    { value: 'Kitten (< 1 year)', label: 'Kitten (< 1 year)' },
    { value: 'Adult (1-8 years)', label: 'Adult (1-8 years)' },
    { value: 'Senior (8+ years)', label: 'Senior (8+ years)' },
  ];

  const sexes = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
  ];

  const attributes = [
    { value: 'OK with other cats', label: 'OK with other cats' },
    { value: 'OK with dogs', label: 'OK with dogs' },
    { value: 'OK with kids', label: 'OK with kids' },
    { value: 'OK with older kids only', label: 'OK with older kids only' },
    { value: 'OK as single', label: 'OK as single' },
    { value: 'Bonded', label: 'Bonded' },
  ];
  const selectTheme = theme => ({
    ...theme,
    borderRadius: 2,
    border: '1px solid rgb(204, 204, 204)',
    colors: {
      ...theme.colors,
      primary25: '#986cda',
      primary: 'rgb(204, 204, 204)',
    },
  });
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-2 fixed w-full z-20 bg-vokra-gray">
      <Select
        className="text-sm"
        theme={selectTheme}
        options={breeds}
        onChange={handleBreedChange}
        isClearable
        placeholder="Type"
      />
      <Select
        className="text-sm"
        theme={selectTheme}
        options={colors}
        onChange={handleColorChange}
        isClearable
        placeholder="Color"
      />
      <Select
        className="text-sm"
        theme={selectTheme}
        options={ages}
        onChange={handleAgeChange}
        isClearable
        placeholder="Age"
      />
      <Select
        className="text-sm"
        theme={selectTheme}
        options={sexes}
        onChange={handleSexChange}
        isClearable
        placeholder="Gender"
      />
      <Select
        className="text-sm col-span-2"
        theme={selectTheme}
        options={attributes}
        onChange={handleAttributeChange}
        isClearable
        isMulti
        placeholder="Attributes..."
      />
      <input
        style={{
          borderColor: 'rgb(204, 204, 204)',
        }}
        className="border rounded-sm px-2.5 py-1.5 col-span-2 text-sm"
        placeholder="Name"
        onChange={handleNameChange}
      />
    </div>
  );
}
