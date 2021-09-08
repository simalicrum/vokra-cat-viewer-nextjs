import { useState } from "react";
import Searchbar from "./Searchbar";
import Cats from "./Cats";

export default function Layout({ cats }) {
  const [breeds, setBreeds] = useState(null);
  const [colors, setColors] = useState(null);
  const [ages, setAges] = useState(null);
  const [sexes, setSexes] = useState(null);
  const [attributes, setAttributes] = useState([]);
  const [name, setName] = useState({ target: { value: "" } });
  return (
    <>
      <Searchbar
        handleBreedChange={setBreeds}
        handleColorChange={setColors}
        handleAgeChange={setAges}
        handleSexChange={setSexes}
        handleAttributeChange={setAttributes}
        handleNameChange={setName}
      />
      <Cats
        cats={cats}
        breeds={breeds}
        colors={colors}
        ages={ages}
        sexes={sexes}
        attributes={attributes}
        name={name}
      />
    </>
  );
}
