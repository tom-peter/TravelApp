const serverapp = require('./serverapp');

describe("Calculating difference between dates.", () => {

   test('Calculating difference between May 31 and May 20.', () => {
      let value = serverapp.dateDiff('2020-05-31', '2020-05-20');
      expect(value).toBe(11);
   });	

   let testdate1 = new Date('2020-10-30');
   let testdate2 = new Date(new Date().toISOString().slice(0,10));
   let testdiff = Math.round((testdate1-testdate2)/(1000*60*60*24));

   test('Calculating difference between Oct 30 and Today.', () => {
      expect(serverapp.dateDiff('2020-10-30')).toBe(testdiff);
   });	
});
