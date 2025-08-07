/* eslint-disable @typescript-eslint/no-unused-vars */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function dummyData() {
  console.log('Starting database seeding...');

  try {
    // 1. Insert main companies
    console.log('Seeding main companies...');
    const mainCompany1 = await prisma.main_company.create({
      data: {
        hash_id: 'main-comp-001',
        company_name: 'Healthcare Solutions Pvt Ltd',
        type: 1,
      },
    });

    const mainCompany2 = await prisma.main_company.create({
      data: {
        hash_id: 'main-comp-002',
        company_name: 'Medical Services Group',
        type: 1,
      },
    });

    // 2. Insert zones
    console.log('Seeding zones...');
    const zone1 = await prisma.zones.create({
      data: {
        hash_id: 'zone-001',
        name: 'North Zone',
        description: 'Northern region zone',
        created_by: 1,
        is_active: 1,
      },
    });

    const zone2 = await prisma.zones.create({
      data: {
        hash_id: 'zone-002',
        name: 'South Zone',
        description: 'Southern region zone',
        created_by: 1,
        is_active: 1,
      },
    });

    // 3. Insert states
    console.log('Seeding states...');
    const state1 = await prisma.states.create({
      data: {
        hash_id: 'state-001',
        name: 'Gujarat',
        zone_id: zone1.id,
        description: 'Gujarat State',
        created_by: 1,
        is_active: 1,
      },
    });

    const state2 = await prisma.states.create({
      data: {
        hash_id: 'state-002',
        name: 'Maharashtra',
        zone_id: zone1.id,
        description: 'Maharashtra State',
        created_by: 1,
        is_active: 1,
      },
    });

    const state3 = await prisma.states.create({
      data: {
        hash_id: 'state-003',
        name: 'Karnataka',
        zone_id: zone2.id,
        description: 'Karnataka State',
        created_by: 1,
        is_active: 1,
      },
    });

    // 4. Insert districts
    console.log('Seeding districts...');
    const district1 = await prisma.districts.create({
      data: {
        hash_id: 'dist-001',
        name: 'Surat',
        state_id: state1.id,
        description: 'Surat District',
        created_by: 1,
        is_active: 1,
      },
    });

    const district2 = await prisma.districts.create({
      data: {
        hash_id: 'dist-002',
        name: 'Ahmedabad',
        state_id: state1.id,
        description: 'Ahmedabad District',
        created_by: 1,
        is_active: 1,
      },
    });

    const district3 = await prisma.districts.create({
      data: {
        hash_id: 'dist-003',
        name: 'Mumbai',
        state_id: state2.id,
        description: 'Mumbai District',
        created_by: 1,
        is_active: 1,
      },
    });

    // 5. Insert city categories
    console.log('Seeding city categories...');
    const cityCategory1 = await prisma.city_categories.create({
      data: {
        hash_id: 'cat-001',
        name: 'Metropolitan',
        description: 'Large metropolitan cities',
        created_by: 1,
        is_active: 1,
      },
    });

    const cityCategory2 = await prisma.city_categories.create({
      data: {
        hash_id: 'cat-002',
        name: 'Urban',
        description: 'Urban cities',
        created_by: 1,
        is_active: 1,
      },
    });

    const cityCategory3 = await prisma.city_categories.create({
      data: {
        hash_id: 'cat-003',
        name: 'Semi-Urban',
        description: 'Semi-urban areas',
        created_by: 1,
        is_active: 1,
      },
    });

    // 6. Insert cities
    console.log('Seeding cities...');
    const city1 = await prisma.cities.create({
      data: {
        hash_id: 'city-001',
        name: 'Surat',
        district_id: district1.id,
        city_category_id: cityCategory1.id,
        description: 'Diamond City',
        created_by: 1,
        is_active: 1,
      },
    });

    const city2 = await prisma.cities.create({
      data: {
        hash_id: 'city-002',
        name: 'Ahmedabad',
        district_id: district2.id,
        city_category_id: cityCategory1.id,
        description: 'Commercial Capital',
        created_by: 1,
        is_active: 1,
      },
    });

    const city3 = await prisma.cities.create({
      data: {
        hash_id: 'city-003',
        name: 'Mumbai',
        district_id: district3.id,
        city_category_id: cityCategory1.id,
        description: 'Financial Capital',
        created_by: 1,
        is_active: 1,
      },
    });

    // 7. Insert HT companies
    console.log('Seeding HT companies...');
    const htCompany1 = await prisma.ht_company.create({
      data: {
        hash_id: 'ht-comp-001',
        main_company_id: mainCompany1.id,
        company_name: 'City Hospital Surat',
        fullname: 'City Hospital Surat Branch',
        asccode: 'CHS001',
        email: 'admin@cityhospital.com',
        contact_no: '9876543210',
        username: 'cityhospital',
        password: 'password123',
        address: 'Ring Road, Surat',
        phone: '0261-2345678',
        state_id: state1.id,
        city_id: city1.id,
        saturday_off: 1,
        sunday_off: 1,
        app_hour: 8,
        parent_sub_series: 1,
        is_generate_token_sms: 1,
        is_print_token: true,
        is_download_token: true,
        token: 'token123',
      },
    });

    const htCompany2 = await prisma.ht_company.create({
      data: {
        hash_id: 'ht-comp-002',
        main_company_id: mainCompany1.id,
        company_name: 'Metro Medical Center',
        fullname: 'Metro Medical Center Ahmedabad',
        asccode: 'MMC002',
        email: 'admin@metromedical.com',
        contact_no: '9876543211',
        username: 'metromedical',
        password: 'password123',
        address: 'SG Highway, Ahmedabad',
        phone: '079-2345678',
        state_id: state1.id,
        city_id: city2.id,
        saturday_off: 0,
        sunday_off: 1,
        app_hour: 10,
        parent_sub_series: 1,
        is_generate_token_sms: 1,
        is_print_token: true,
        is_download_token: true,
        token: 'token456',
      },
    });

    const htCompany3 = await prisma.ht_company.create({
      data: {
        hash_id: 'ht-comp-003',
        main_company_id: mainCompany2.id,
        company_name: 'Healthcare Plus Mumbai',
        fullname: 'Healthcare Plus Mumbai Branch',
        asccode: 'HPM003',
        email: 'admin@healthcareplus.com',
        contact_no: '9876543212',
        username: 'healthcareplus',
        password: 'password123',
        address: 'Andheri East, Mumbai',
        phone: '022-2345678',
        state_id: state2.id,
        city_id: city3.id,
        saturday_off: 1,
        sunday_off: 1,
        app_hour: 12,
        parent_sub_series: 1,
        is_generate_token_sms: 0,
        is_print_token: true,
        is_download_token: true,
        token: 'token789',
      },
    });

    // 8. Insert languages
    console.log('Seeding languages...');
    const language1 = await prisma.ht_languages.create({
      data: {
        hash_id: 'lang-001',
        name: 'English',
        code: 'EN',
        title: 'English',
      },
    });

    const language2 = await prisma.ht_languages.create({
      data: {
        hash_id: 'lang-002',
        name: 'Hindi',
        code: 'HI',
        title: 'हिंदी',
      },
    });

    const language3 = await prisma.ht_languages.create({
      data: {
        hash_id: 'lang-003',
        name: 'Gujarati',
        code: 'GU',
        title: 'ગુજરાતી',
      },
    });

    // 9. Insert company languages
    console.log('Seeding company languages...');
    await prisma.ht_company_languages.createMany({
      data: [
        {
          hash_id: 'comp-lang-001',
          company_id: htCompany1.id,
          language_id: language1.id,
        },
        {
          hash_id: 'comp-lang-002',
          company_id: htCompany1.id,
          language_id: language2.id,
        },
        {
          hash_id: 'comp-lang-003',
          company_id: htCompany1.id,
          language_id: language3.id,
        },
        {
          hash_id: 'comp-lang-004',
          company_id: htCompany2.id,
          language_id: language1.id,
        },
        {
          hash_id: 'comp-lang-005',
          company_id: htCompany2.id,
          language_id: language2.id,
        },
        {
          hash_id: 'comp-lang-006',
          company_id: htCompany3.id,
          language_id: language1.id,
        },
        {
          hash_id: 'comp-lang-007',
          company_id: htCompany3.id,
          language_id: language2.id,
        },
      ],
    });

    // 10. Insert parent series (top-level series)
    console.log('Seeding parent series...');
    const series1 = await prisma.ht_series.create({
      data: {
        hash_id: 'series-001',
        series_english_name: 'General Medicine',
        series_hindi_name: 'सामान्य चिकित्सा',
        series_regional_name: 'સામાન્ય દવા',
        comapany_id: htCompany1.id,
        abbreviation: 'GM',
        description: 'General Medicine Department',
        order: 1,
        priority: 1,
        avg_waiting_time: 15,
        start_token: 1,
        end_token: 100,
        parent_series_id: null,
        series_image: 'https://example.com/images/general-medicine.jpg',
        start_time: '09:00',
        end_time: '17:00',
        slot_duration: 30,
        total_counter: 5,
        toke_per_slot: 2,
        allow_future_appointment: 1,
        allow_same_day_appointment: 1,
        future_appointment_days: 7,
        display_form: 0,
        is_active: 1,
      },
    });

    const series2 = await prisma.ht_series.create({
      data: {
        hash_id: 'series-002',
        series_english_name: 'Cardiology',
        series_hindi_name: 'हृदय रोग',
        series_regional_name: 'હૃદય રોગ',
        comapany_id: htCompany1.id,
        abbreviation: 'CARD',
        description: 'Cardiology Department',
        order: 2,
        priority: 2,
        avg_waiting_time: 20,
        start_token: 1,
        end_token: 50,
        parent_series_id: null,
        series_image: 'https://example.com/images/cardiology.jpg',
        start_time: '10:00',
        end_time: '16:00',
        slot_duration: 45,
        total_counter: 3,
        toke_per_slot: 1,
        allow_future_appointment: 1,
        allow_same_day_appointment: 1,
        future_appointment_days: 14,
        display_form: 0,
        is_active: 1,
      },
    });

    const series3 = await prisma.ht_series.create({
      data: {
        hash_id: 'series-003',
        series_english_name: 'Orthopedics',
        series_hindi_name: 'हड्डी रोग',
        series_regional_name: 'હાડકાં રોગ',
        comapany_id: htCompany1.id,
        abbreviation: 'ORTHO',
        description: 'Orthopedics Department',
        order: 3,
        priority: 3,
        avg_waiting_time: 25,
        start_token: 1,
        end_token: 75,
        parent_series_id: null,
        series_image: 'https://example.com/images/orthopedics.jpg',
        start_time: '08:00',
        end_time: '18:00',
        slot_duration: 60,
        total_counter: 4,
        toke_per_slot: 1,
        allow_future_appointment: 1,
        allow_same_day_appointment: 0,
        future_appointment_days: 0,
        display_form: 1,
        is_active: 1,
      },
    });

    const series4 = await prisma.ht_series.create({
      data: {
        hash_id: 'series-004',
        series_english_name: 'Pediatrics',
        series_hindi_name: 'बाल रोग',
        series_regional_name: 'બાળ રોગ',
        comapany_id: htCompany2.id,
        abbreviation: 'PEDS',
        description: 'Pediatrics Department',
        order: 1,
        priority: 1,
        avg_waiting_time: 10,
        start_token: 1,
        end_token: 80,
        parent_series_id: null,
        series_image: 'https://example.com/images/pediatrics.jpg',
        start_time: '09:00',
        end_time: '17:00',
        slot_duration: 20,
        total_counter: 6,
        toke_per_slot: 3,
        allow_future_appointment: 1,
        allow_same_day_appointment: 1,
        future_appointment_days: 7,
        display_form: 0,
        is_active: 1,
      },
    });

    const series5 = await prisma.ht_series.create({
      data: {
        hash_id: 'series-005',
        series_english_name: 'Dermatology',
        series_hindi_name: 'त्वचा रोग',
        series_regional_name: 'ચામડીના રોગ',
        comapany_id: htCompany2.id,
        abbreviation: 'DERM',
        description: 'Dermatology Department',
        order: 2,
        priority: 2,
        avg_waiting_time: 15,
        start_token: 1,
        end_token: 60,
        parent_series_id: null,
        series_image: 'https://example.com/images/dermatology.jpg',
        start_time: '10:00',
        end_time: '16:00',
        slot_duration: 30,
        total_counter: 2,
        toke_per_slot: 2,
        allow_future_appointment: 1,
        allow_same_day_appointment: 1,
        future_appointment_days: 10,
        display_form: 0,
        is_active: 1,
      },
    });

    const series6 = await prisma.ht_series.create({
      data: {
        hash_id: 'series-006',
        series_english_name: 'Emergency',
        series_hindi_name: 'आपातकालीन',
        series_regional_name: 'કટોકટી',
        comapany_id: htCompany3.id,
        abbreviation: 'EMRG',
        description: 'Emergency Department',
        order: 1,
        priority: 1,
        avg_waiting_time: 5,
        start_token: 1,
        end_token: 200,
        parent_series_id: null,
        series_image: 'https://example.com/images/emergency.jpg',
        start_time: '00:00',
        end_time: '23:59',
        slot_duration: 15,
        total_counter: 10,
        toke_per_slot: 5,
        allow_future_appointment: 0,
        allow_same_day_appointment: 1,
        future_appointment_days: 0,
        display_form: 0,
        is_active: 1,
      },
    });

    // 11. Insert sub-series (child series)
    console.log('Seeding sub-series...');
    const series7 = await prisma.ht_series.create({
      data: {
        hash_id: 'series-007',
        series_english_name: 'Consultation',
        series_hindi_name: 'परामर्श',
        series_regional_name: 'સલાહ',
        comapany_id: htCompany1.id,
        abbreviation: 'GM-CON',
        description: 'General Medicine Consultation',
        order: 1,
        priority: 1,
        avg_waiting_time: 10,
        start_token: 1,
        end_token: 50,
        parent_series_id: series1.id,
        series_image: 'https://example.com/images/consultation.jpg',
        start_time: '09:00',
        end_time: '17:00',
        slot_duration: 15,
        total_counter: 3,
        toke_per_slot: 2,
        allow_future_appointment: 1,
        allow_same_day_appointment: 1,
        future_appointment_days: 7,
        display_form: 0,
        is_active: 1,
      },
    });

    const series8 = await prisma.ht_series.create({
      data: {
        hash_id: 'series-008',
        series_english_name: 'Follow-up',
        series_hindi_name: 'अनुवर्ती',
        series_regional_name: 'ફોલો-અપ',
        comapany_id: htCompany1.id,
        abbreviation: 'GM-FU',
        description: 'General Medicine Follow-up',
        order: 2,
        priority: 2,
        avg_waiting_time: 5,
        start_token: 1,
        end_token: 30,
        parent_series_id: series1.id,
        series_image: 'https://example.com/images/followup.jpg',
        start_time: '14:00',
        end_time: '17:00',
        slot_duration: 10,
        total_counter: 2,
        toke_per_slot: 3,
        allow_future_appointment: 1,
        allow_same_day_appointment: 1,
        future_appointment_days: 3,
        display_form: 0,
        is_active: 1,
      },
    });

    const series9 = await prisma.ht_series.create({
      data: {
        hash_id: 'series-009',
        series_english_name: 'ECG',
        series_hindi_name: 'ईसीजी',
        series_regional_name: 'ઇસીજી',
        comapany_id: htCompany1.id,
        abbreviation: 'CARD-ECG',
        description: 'ECG Test',
        order: 1,
        priority: 1,
        avg_waiting_time: 15,
        start_token: 1,
        end_token: 25,
        parent_series_id: series2.id,
        series_image: 'https://example.com/images/ecg.jpg',
        start_time: '10:00',
        end_time: '16:00',
        slot_duration: 20,
        total_counter: 1,
        toke_per_slot: 1,
        allow_future_appointment: 1,
        allow_same_day_appointment: 1,
        future_appointment_days: 14,
        display_form: 0,
        is_active: 1,
      },
    });

    const series10 = await prisma.ht_series.create({
      data: {
        hash_id: 'series-010',
        series_english_name: 'Echo',
        series_hindi_name: 'इको',
        series_regional_name: 'ઇકો',
        comapany_id: htCompany1.id,
        abbreviation: 'CARD-ECHO',
        description: 'Echocardiography',
        order: 2,
        priority: 2,
        avg_waiting_time: 30,
        start_token: 1,
        end_token: 20,
        parent_series_id: series2.id,
        series_image: 'https://example.com/images/echo.jpg',
        start_time: '11:00',
        end_time: '15:00',
        slot_duration: 45,
        total_counter: 1,
        toke_per_slot: 1,
        allow_future_appointment: 1,
        allow_same_day_appointment: 1,
        future_appointment_days: 14,
        display_form: 0,
        is_active: 1,
      },
    });

    const series11 = await prisma.ht_series.create({
      data: {
        hash_id: 'series-011',
        series_english_name: 'Vaccination',
        series_hindi_name: 'टीकाकरण',
        series_regional_name: 'રસીકરણ',
        comapany_id: htCompany2.id,
        abbreviation: 'PEDS-VAC',
        description: 'Vaccination Services',
        order: 1,
        priority: 1,
        avg_waiting_time: 5,
        start_token: 1,
        end_token: 40,
        parent_series_id: series4.id,
        series_image: 'https://example.com/images/vaccination.jpg',
        start_time: '09:00',
        end_time: '17:00',
        slot_duration: 10,
        total_counter: 3,
        toke_per_slot: 4,
        allow_future_appointment: 1,
        allow_same_day_appointment: 1,
        future_appointment_days: 7,
        display_form: 1,
        is_active: 1,
      },
    });

    const series12 = await prisma.ht_series.create({
      data: {
        hash_id: 'series-012',
        series_english_name: 'Growth Check',
        series_hindi_name: 'विकास जांच',
        series_regional_name: 'વૃદ્ધિ તપાસ',
        comapany_id: htCompany2.id,
        abbreviation: 'PEDS-GC',
        description: 'Growth and Development Check',
        order: 2,
        priority: 2,
        avg_waiting_time: 10,
        start_token: 1,
        end_token: 30,
        parent_series_id: series4.id,
        series_image: 'https://example.com/images/growth.jpg',
        start_time: '10:00',
        end_time: '16:00',
        slot_duration: 15,
        total_counter: 2,
        toke_per_slot: 2,
        allow_future_appointment: 1,
        allow_same_day_appointment: 1,
        future_appointment_days: 7,
        display_form: 0,
        is_active: 1,
      },
    });

    // 12. Insert series input fields
    console.log('Seeding series input fields...');
    await prisma.ht_series_input_fields.createMany({
      data: [
        // Fields for Orthopedics (series-003)
        {
          hash_id: 'field-001',
          series_id: series3.id,
          field_english_name: 'Patient Name',
          field_hindi_name: 'रोगी का नाम',
          field_regional_name: 'દર્દીનું નામ',
          field_type: 'text',
          is_required: 1,
        },
        {
          hash_id: 'field-002',
          series_id: series3.id,
          field_english_name: 'Age',
          field_hindi_name: 'आयु',
          field_regional_name: 'ઉંમર',
          field_type: 'number',
          is_required: 1,
        },
        {
          hash_id: 'field-003',
          series_id: series3.id,
          field_english_name: 'Gender',
          field_hindi_name: 'लिंग',
          field_regional_name: 'લિંગ',
          field_type: 'select',
          is_required: 1,
        },
        {
          hash_id: 'field-004',
          series_id: series3.id,
          field_english_name: 'Phone Number',
          field_hindi_name: 'फोन नंबर',
          field_regional_name: 'ફોન નંબર',
          field_type: 'tel',
          is_required: 1,
        },
        {
          hash_id: 'field-005',
          series_id: series3.id,
          field_english_name: 'Problem Description',
          field_hindi_name: 'समस्या का विवरण',
          field_regional_name: 'સમસ્યાનું વર્ણન',
          field_type: 'textarea',
          is_required: 1,
        },
        {
          hash_id: 'field-006',
          series_id: series3.id,
          field_english_name: 'Previous Surgery',
          field_hindi_name: 'पूर्व शल्यचिकित्सा',
          field_regional_name: 'અગાઉની સર્જરી',
          field_type: 'select',
          is_required: 0,
        },
        // Fields for Vaccination (series-011)
        {
          hash_id: 'field-007',
          series_id: series11.id,
          field_english_name: 'Child Name',
          field_hindi_name: 'बच्चे का नाम',
          field_regional_name: 'બાળકનું નામ',
          field_type: 'text',
          is_required: 1,
        },
        {
          hash_id: 'field-008',
          series_id: series11.id,
          field_english_name: 'Date of Birth',
          field_hindi_name: 'जन्म तिथि',
          field_regional_name: 'જન્મ તારીખ',
          field_type: 'date',
          is_required: 1,
        },
        {
          hash_id: 'field-009',
          series_id: series11.id,
          field_english_name: 'Weight',
          field_hindi_name: 'वजन',
          field_regional_name: 'વજન',
          field_type: 'number',
          is_required: 1,
        },
        {
          hash_id: 'field-010',
          series_id: series11.id,
          field_english_name: 'Height',
          field_hindi_name: 'ऊंचाई',
          field_regional_name: 'ઊંચાઈ',
          field_type: 'number',
          is_required: 1,
        },
        {
          hash_id: 'field-011',
          series_id: series11.id,
          field_english_name: 'Parent Name',
          field_hindi_name: 'माता-पिता का नाम',
          field_regional_name: 'માતા-પિતાનું નામ',
          field_type: 'text',
          is_required: 1,
        },
        {
          hash_id: 'field-012',
          series_id: series11.id,
          field_english_name: 'Parent Phone',
          field_hindi_name: 'माता-पिता का फोन',
          field_regional_name: 'માતા-પિતાનો ફોન',
          field_type: 'tel',
          is_required: 1,
        },
        {
          hash_id: 'field-013',
          series_id: series11.id,
          field_english_name: 'Vaccination Type',
          field_hindi_name: 'टीकाकरण का प्रकार',
          field_regional_name: 'રસીકરણનો પ્રકાર',
          field_type: 'select',
          is_required: 1,
        },
      ],
    });
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
    console.log('Database seeding completed.');
  }
}
