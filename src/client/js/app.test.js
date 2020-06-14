import { projectData, formValidation } from "./app.js";

describe("Testing form validation.", () => {

   beforeEach(() => {
      document.body.innerHTML = '<div id="error"></div>';
   });

   test('No errors', () => {
      projectData.duration = 8;
      projectData.countryCode = 'US';
      let value = formValidation();
      expect(value).toBe(0);
   });	

   test('One error: duration of the trip is negative number.', () => {
      projectData.duration = -5;
      projectData.countryCode = 'US';
      let value = formValidation();
      expect(value).toBe(1);
   });	

   test('Two errors: duration of the trip is negative + no country selected.', () => {
      projectData.duration = -5;
      projectData.countryCode = 'false';
      let value = formValidation();
      expect(value).toBe(2);
   });	
});
