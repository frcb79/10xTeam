-- Disposable integration database only, created by the QA operator.
insert into auth.users(id) values ('11110000-0000-4000-8000-000000000001'),('11110000-0000-4000-8000-000000000002');
insert into public.onboarding_sessions(id,owner_user_id,plan,provision)
select id, id,
  jsonb_build_object('version',1,'modules',jsonb_build_array(jsonb_build_object('id','forms','mode','connect','consent',
    jsonb_build_object('actorId',id::text,'planVersion',1,'scope','prepare_forms_no_paid_services')))),
  jsonb_build_object('locationId',loc,'status','configured')
from (values ('11110000-0000-4000-8000-000000000001'::uuid,'synthetic-dev-form'),('11110000-0000-4000-8000-000000000002'::uuid,'synthetic-growth-form')) as fixture(id,loc);
insert into public.onboarding_form_routes(source,session_id,location_id,service_field_id,approval_reference,enabled)
values ('dev_contact','11110000-0000-4000-8000-000000000001','synthetic-dev-form','qa-field','fixture-only',true),
       ('growth_contact','11110000-0000-4000-8000-000000000002','synthetic-growth-form','qa-field','fixture-only',true);
