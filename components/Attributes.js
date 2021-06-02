import Attribute from './Attribute';

export default function Attributes({ cats, cat }) {
  const catBondedID = thing =>
    thing.PreviousIds.filter(i => i.Type === 'Visibility').map(i => i.IdValue);
  const attributeColors = new Map();
  attributeColors.set('Bonded', 'bg-vokra-light text-white');
  attributeColors.set('Special Adoption', 'bg-vokra-dark text-white');
  return (
    <div>
      <ul className="flex flex-wrap">
        {cat.Attributes.map(value => value.AttributeName).includes(
          'Special Adoption'
        ) ? (
          <Attribute
            attribute={{ AttributeName: 'Special Adoption' }}
            cat={cat}
            cats={cats}
            catBondedID={catBondedID}
            extraClassName={attributeColors.get('Special Adoption')}
          />
        ) : (
          ''
        )}
        {cat.Attributes.filter(
          attribute =>
            attribute.Publish === 'Yes' &&
            attribute.AttributeName !== 'Special Adoption'
        ).map(attribute => (
          <Attribute
            attribute={attribute}
            cat={cat}
            cats={cats}
            catBondedID={catBondedID}
            extraClassName={
              attributeColors.get(attribute.AttributeName) ||
              'bg-gray-200 text-gray-600'
            }
          />
        ))}
      </ul>
    </div>
  );
}
