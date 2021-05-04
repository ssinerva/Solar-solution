<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/emailjs-com@2/dist/email.min.js"></script>

<script>
    var street=""
    var city="";
    var state="AA";
    var zip=0000;
    var email='';
    var yourName = '';
    var phone ='';

    var canopiesNumberSpaces = 0;
    var chargersNumberSpaces = 0;
    var rooftopTotalSquareFeet = 0;
    var rooftopPercentageAvailable = 0;

    // rate in $/kwh
    var stateEnergyCost=0.00;
    // yeild in kwh/kw
    var stateEnergyYeild=0;

    var isRooftop=false;
    var isCanopies=false;
    var isCanopies=false;

    // constants
    var constSolarPvSizePerSpaceKw=3.096; //based on 9ftx20ft parking space and 17.2W/sqft
    var constCarbonOffsetTonsPerKwh=0.000707;
    var constTaxCreditRate=0.26; //26%
    var constIncomeTaxRate=0.21; //21%
    var constUtilityEscalationRate=0.02;
    var constRooftopSolarWattsSqft=11.6;
    var constChargersSolarCostSpace=15000;
    var constChargersChargerCostEach=5000;
    var constCanopiesSolarCostSpace=10000;
    var constRooftopSolarCostWatt=1.80;



    onLoad();

    function onLoad() {

        var inputs = document.querySelectorAll('[id^="input-form-"]');
        inputs.forEach(function(input) {
            input.onkeydown=doCalculations;
            input.onchange=doCalculations;
            input.onpaste=doCalculations;
            input.oninput=doCalculations;
        });
        /*
        var inputs = document.querySelectorAll('[id^="input-address-"]');
        inputs.forEach(function(input) {
            input.onkeydown=onAddressChange;
            input.onchange=onAddressChange;
            input.onpaste=onAddressChange;
            input.oninput=onAddressChange;
        });
        */

    }

    function onClickAddressNext(){

        street = document.getElementById("input-address-street").value;
        city = document.getElementById("input-address-city").value;
        zip = document.getElementById("input-address-zip").value;
        state = document.getElementById("input-address-state").value;
        email = document.getElementById("input-address-email").value;
        yourName = document.getElementById("input-address-name").value;
        phone = document.getElementById("input-address-phone").value;

        var regexStreet = new RegExp("^.+\ .+$");
        var regexCity = new RegExp("^.+$");
        var regexZip = new RegExp("^[0-9]{5}$");
        var regexState = new RegExp("^[A-Z][A-Z]$");
        var regexEmail = new RegExp("^.+@.+\..+$");
        var regexName = new RegExp("^.+ .+$");
        var regexPhone = new RegExp(".*[0-9].*[0-9].*[0-9].*[0-9].*[0-9].*[0-9].*[0-9].*[0-9].*[0-9].*[0-9].*");
        
        var validStreet = regexStreet.test(street);
        var validCity = regexCity.test(city);
        var validZip = regexZip.test(zip);
        var validSate = regexState.test(state);
        var validEmail = regexEmail.test(email);
        var validName = regexName.test(yourName);
        var validPhone = regexPhone.test(phone);

        if (validSate) {
            stateEnergyCost=stateEnergyCostLookup[state];
            stateEnergyYeild=stateEnergyYeildLookup[state];
        }
        
        var isAdderessValid = (validStreet && validCity && validZip && validSate);
        //document.getElementById("button-address-next").disabled = !isAdderessValid;

        if(!isAdderessValid){
            document.getElementById("error-message").innerHTML="Please enter an address for your dealership";
        }
        else if(!(validEmail)){
            document.getElementById("error-message").innerHTML="Please enter an email address";
        }
        else if(!(validPhone)){
            document.getElementById("error-message").innerHTML="Please enter a valid phone number";
        }
        else if(!(validName)){
            document.getElementById("error-message").innerHTML="Please enter the name of the dealership";
        }
        else {
            document.getElementById("div-section-address").hidden = true;
            document.getElementById("div-section-form").hidden = false;
        }
    }

    function doCalculations() {

        canopiesNumberSpaces = document.getElementById("input-form-canopies").value;
        chargersNumberSpaces = document.getElementById("input-form-chargingstations").value;
        rooftopTotalSquareFeet = document.getElementById("input-form-sqft").value;
        rooftopPercentageAvailable = document.getElementById("input-form-percentage").value;

        // get the value of the checkboxes
        isRooftop = document.getElementById("checkbox-rooftop").checked;
        isCanopies = document.getElementById("checkbox-canopies").checked;
        isChargers = document.getElementById("checkbox-chargers").checked;

        // hide/unhide the inputs depending on the checkboxes
        document.getElementById("div-form-canopies").hidden = !isCanopies;
        document.getElementById("div-form-chargingstations").hidden = !isChargers;
        document.getElementById("div-form-rooftop").hidden = !isRooftop;

        // zero out any they are not interested in
        if (!isCanopies){
            canopiesNumberSpaces = 0;
        }

        if (!isChargers){
            chargersNumberSpaces = 0;
        }

        if (!isRooftop){
            rooftopTotalSquareFeet = 0;
            rooftopPercentageAvailable = 0;
        }

        // ev charging spaces
        var chargersTotalSolarPvSizeKw=chargersNumberSpaces*constSolarPvSizePerSpaceKw;
        var chargersTotalCost=(constChargersChargerCostEach+constChargersSolarCostSpace)*chargersNumberSpaces;
        var chargersTotalSolarYeildKwh=constSolarPvSizePerSpaceKw*chargersNumberSpaces*stateEnergyYeild;
        var chargersCarbonOffsetTons=chargersTotalSolarYeildKwh*constCarbonOffsetTonsPerKwh;
        var chargersAnnualElectricitySavings=chargersTotalSolarYeildKwh*stateEnergyCost;
        var chargersTaxCreditOnSoalr=chargersNumberSpaces*constChargersSolarCostSpace*constTaxCreditRate;
        var chargersDepreciationTaxBenefit=(((constChargersSolarCostSpace*chargersNumberSpaces)-(chargersTaxCreditOnSoalr*0.50))*constIncomeTaxRate)+(constChargersChargerCostEach*chargersNumberSpaces*constIncomeTaxRate);
        var chargersNetCostAfterTaxBenefits=chargersTotalCost-(chargersTaxCreditOnSoalr+chargersDepreciationTaxBenefit);
        var chargersTotalElectricitySavings25Year=doElectricitySavingsOverYears(chargersAnnualElectricitySavings, constUtilityEscalationRate, 25);

        // canopy spaces
        var canopiesTotalSolarPvSizeKw=canopiesNumberSpaces*constSolarPvSizePerSpaceKw;
        var canopiesTotalCost=constCanopiesSolarCostSpace*canopiesNumberSpaces;
        var canopiesTotalSolarYeildKwh=constSolarPvSizePerSpaceKw*canopiesNumberSpaces*stateEnergyYeild;
        var canopiesCarbonOffsetTons=canopiesTotalSolarYeildKwh*constCarbonOffsetTonsPerKwh;
        var canopiesAnnualElectricitySavings=canopiesTotalSolarYeildKwh*stateEnergyCost;
        var canopiesTaxCreditOnSoalr=canopiesNumberSpaces*constCanopiesSolarCostSpace*constTaxCreditRate;
        var canopiesDepreciationTaxBenefit=(canopiesTotalCost-canopiesTaxCreditOnSoalr*0.5)*constIncomeTaxRate;
        var canopiesNetCostAfterTaxBenefits=canopiesTotalCost-(canopiesTaxCreditOnSoalr+canopiesDepreciationTaxBenefit);
        var canopiesTotalElectricitySavings25Year=doElectricitySavingsOverYears(canopiesAnnualElectricitySavings, constUtilityEscalationRate, 25);

        // rooftop
        var rooftopTotalSolarPvSizeKw=rooftopTotalSquareFeet*rooftopPercentageAvailable/100*constRooftopSolarWattsSqft/1000;
        var rooftopTotalCost=rooftopTotalSolarPvSizeKw*constRooftopSolarCostWatt*1000;
        var rooftopTotalSolarYeildKwh=rooftopTotalSolarPvSizeKw*stateEnergyYeild;
        var rooftopCarbonOffsetTons=rooftopTotalSolarYeildKwh*constCarbonOffsetTonsPerKwh;
        var rooftopAnnualElectricitySavings=rooftopTotalSolarYeildKwh*stateEnergyCost;
        var rooftopTaxCreditOnSoalr=rooftopTotalCost*constTaxCreditRate;
        var rooftopDepreciationTaxBenefit=(rooftopTotalCost-rooftopTaxCreditOnSoalr*0.5)*constIncomeTaxRate;
        var rooftopNetCostAfterTaxBenefits=rooftopTotalCost-(rooftopTaxCreditOnSoalr+rooftopDepreciationTaxBenefit);
        var rooftopTotalElectricitySavings25Year=doElectricitySavingsOverYears(rooftopAnnualElectricitySavings, constUtilityEscalationRate, 25);

        console.log("do calculation"+totalCarbonOffsetTons);

        var totalSolarPvSizeKw=chargersTotalSolarPvSizeKw+canopiesTotalSolarPvSizeKw+rooftopTotalSolarPvSizeKw;
        var totalCost=chargersTotalCost+canopiesTotalCost+rooftopTotalCost;
        var totalCarbonOffsetTons=chargersCarbonOffsetTons+canopiesCarbonOffsetTons+rooftopCarbonOffsetTons;
        var totalAnnualElectricitySavings=chargersAnnualElectricitySavings+canopiesAnnualElectricitySavings+rooftopAnnualElectricitySavings;
        var totalTaxCreditOnSolar=chargersTaxCreditOnSoalr+canopiesTaxCreditOnSoalr+rooftopTaxCreditOnSoalr;
        var totalDepreciationTaxBenefit=chargersDepreciationTaxBenefit+canopiesDepreciationTaxBenefit+rooftopDepreciationTaxBenefit;
        var totalTaxBenefits=totalTaxCreditOnSolar+totalDepreciationTaxBenefit;
        var totalNetCostAfterTaxBenefits=chargersNetCostAfterTaxBenefits+canopiesNetCostAfterTaxBenefits+rooftopNetCostAfterTaxBenefits;
        var totalSimplePaybackYears=totalNetCostAfterTaxBenefits/totalAnnualElectricitySavings;
        var totalElectricitySavings25Year=chargersTotalElectricitySavings25Year+canopiesTotalElectricitySavings25Year+rooftopTotalElectricitySavings25