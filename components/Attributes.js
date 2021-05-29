import Attribute from './Attribute';

export default function Attributes({ cats, cat }) {
  const catBondedID = thing =>
    thing.PreviousIds.filter(i => i.Type === 'Visibility').map(i => i.IdValue);
  return (
    <ul className="m-4 flex">
      {cat.Attributes.filter(attribute => attribute.Publish === 'Yes').map(
        attribute => (
          <Attribute
            attribute={attribute}
            cat={cat}
            cats={cats}
            catBondedID={catBondedID}
            extraClassName={
              attribute.AttributeName === 'Bonded'
                ? 'bg-vokra-light text-white'
                : 'bg-gray-200 text-gray-600'
            }
          />
        )
      )}
    </ul>
  );
}
