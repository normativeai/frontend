var ex1 = {
    id: 1,
  title: 'International Sale of Goods',
  comment: 'first formalization by Tomer',
  lastEdit: new Date(),
  vocabulary: [
    { vid: 1, symbol: 'D', desc: 'the seller delivers the goods, hands over the documents and transfers the \
          property according to the procedure described in the contract'},
    { vid: 2, symbol: 'D0.1', desc: 'the contract requires the seller to take care of the carriage of goods'},
    { vid: 3, symbol: 'D0.2', desc: 'the contract relates to goods to be produced at a particular place'}
  ],
  facts: [
    { fid: 1, desc: 'It must be the case that the seller delivers the goods, hand over any documents relating to them and transfer the property in the goods, as required by the contract and this Convention', formalization: 'Id(Ob(D))'},
    { fid: 2, desc: 'It must be the case that the buyer pays for the goods', formalization: 'Id(Ob(P))'}
  ],
  queries: [
    {
      qid: 1,
      title: 'CTD example',
      description: 'In case the contract requires the seller to take care of the carriage of the goods, does the seller have to notify the buyer of consignment if he/she hands them over to the first carrier but cannot identify them with appropriate markings, shipping documents, etc.?',
      assumptions: [
        'D0.1', 'D1', '~ D1.1'
      ],
      goal: 'Ob(D1.2)'
    },
    {
      qid: 2,
      title: 'CTD example 2',
      description: 'In case the contract requires the seller to take care of the carriage of the goods, does the seller have to notify the buyer of consignment if he/she hands them over to the first carrier but cannot identify them with appropriate markings, shipping documents, etc.?',
      assumptions: [
        'D0.1', 'D1', '~ D1.1'
      ],
      goal: 'Ob(D1.2)'
    }  
  ],
  lastVocId: 3,
  lastFactId: 2,
  lastQueryId: 2
}

var ex2 = {
  id: 2,
  title: 'Another Norm Formalization',
  comment: 'my very good description',
  lastEdit: new Date(),
  vocabulary: [
    { vid: 1, symbol: 'D', desc: 'the seller delivers the goods, hands over the documents and transfers the \
          property according to the procedure described in the contract'},
    { vid: 2, symbol: 'D0.1', desc: 'the contract requires the seller to take care of the carriage of goods'},
    { vid: 3, symbol: 'D0.2', desc: 'the contract relates to goods to be produced at a particular place'}
  ],
  facts: [
    { fid: 1, desc: 'It must be the case that the seller delivers the goods, hand over any documents relating to them and transfer the property in the goods, as required by the contract and this Convention', formalization: 'Id(Ob(D))'},
    { fid: 2, desc: 'It must be the case that the seller delivers the goods, hand over any documents relating to them and transfer the property in the goods, as required by the contract and this Convention', formalization: 'Id(Ob(D))'}
  ],
  queries: [
    {
      qid: 1,
      title: 'CTD example',
      description: 'In case the contract requires the seller to take care of the carriage of the goods, does the seller have to notify the buyer of consignment if he/she hands them over to the first carrier but cannot identify them with appropriate markings, shipping documents, etc.?',
      assumptions: [
        'D0.1', 'D1', '~ D1.1'
      ],
      goal: 'Ob(D1.2)'
    }     
  ],
  lastVocId: 3,
  lastFactId: 2,
  lastQueryId: 1
}
