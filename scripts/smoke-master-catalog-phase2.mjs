import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const password = process.env.LOCAL_TEST_PASSWORD

if (!url || !publishableKey || !password) {
  throw new Error('Local Supabase URL, publishable key, and LOCAL_TEST_PASSWORD are required')
}

if (!/^http:\/\/(127\.0\.0\.1|localhost):/.test(url)) {
  throw new Error(`Refusing to smoke-test a non-local Supabase URL: ${url}`)
}

const supabase = createClient(url, publishableKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const createdBoqIds = []

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

async function cleanup() {
  for (const boqId of createdBoqIds.reverse()) {
    const { error: itemError } = await supabase
      .from('boq_items')
      .delete()
      .eq('boq_id', boqId)
    if (itemError) throw itemError

    const { error: routeError } = await supabase
      .from('boq_routes')
      .delete()
      .eq('boq_id', boqId)
    if (routeError) throw routeError

    const { error: boqError } = await supabase
      .from('boq')
      .delete()
      .eq('id', boqId)
    if (boqError) throw boqError
  }
}

try {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'local.admin@ntplc.co.th',
    password,
  })
  if (authError) throw authError

  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('org_id, department_id, sector_id, role, status')
    .eq('id', authData.user.id)
    .single()
  if (profileError) throw profileError
  assert(profile.role === 'admin' && profile.status === 'active', 'Local admin profile is not active')

  const { data: pointer, error: pointerError } = await supabase
    .from('price_list_default_version')
    .select('version_id')
    .eq('id', true)
    .single()
  if (pointerError) throw pointerError

  const { data: version, error: versionError } = await supabase
    .from('price_list_versions')
    .select('id, version_string, status')
    .eq('id', pointer.version_id)
    .eq('status', 'active')
    .single()
  if (versionError) throw versionError

  const { data: priceItem, error: priceError } = await supabase
    .from('price_list')
    .select('id, item_code, item_name, unit, material_cost, labor_cost, unit_cost, category, version_id')
    .eq('version_id', version.id)
    .eq('is_active', true)
    .not('category', 'is', null)
    .order('item_code')
    .limit(1)
    .single()
  if (priceError) throw priceError

  const runId = new Date().toISOString()
  const { data: sourceBoq, error: createError } = await supabase
    .from('boq')
    .insert({
      estimator_name: 'Local Phase 2 QA',
      document_date: new Date().toISOString().slice(0, 10),
      project_name: `LOCAL QA Master Catalog ${runId}`,
      department: 'Local rehearsal',
      status: 'draft',
      created_by: authData.user.id,
      org_id: profile.org_id,
      department_id: profile.department_id,
      sector_id: profile.sector_id,
      price_list_version_id: version.id,
    })
    .select('id, price_list_version_id')
    .single()
  if (createError) throw createError
  createdBoqIds.push(sourceBoq.id)
  assert(sourceBoq.price_list_version_id === version.id, 'Create BOQ did not keep the default version')

  const quantity = 2
  const totalMaterial = Number(priceItem.material_cost) * quantity
  const totalLabor = Number(priceItem.labor_cost) * quantity
  const totalCost = Number(priceItem.unit_cost) * quantity

  const { error: saveError } = await supabase.rpc('save_boq_with_routes', {
    p_boq_id: sourceBoq.id,
    p_boq_data: {
      estimator_name: 'Local Phase 2 QA',
      document_date: new Date().toISOString().slice(0, 10),
      project_name: `LOCAL QA Master Catalog ${runId}`,
      route: 'Local QA route',
      construction_area: 'Local only',
      department: 'Local rehearsal',
      total_material_cost: totalMaterial,
      total_labor_cost: totalLabor,
      total_cost: totalCost,
      factor_f: 1,
      total_with_factor_f: totalCost,
      total_with_vat: totalCost,
      factor_f_raw: 1,
      factor_f_lower_cost: 1,
      factor_f_upper_cost: 1,
      factor_f_lower_value: 1,
      factor_f_upper_value: 1,
    },
    p_routes: [{
      route_name: 'Local QA route',
      route_description: 'Automatically cleaned up',
      construction_area: 'Local only',
      total_material_cost: totalMaterial,
      total_labor_cost: totalLabor,
      total_cost: totalCost,
      items: [{
        item_order: 1,
        price_list_id: priceItem.id,
        item_name: priceItem.item_name,
        quantity,
        unit: priceItem.unit,
        material_cost_per_unit: Number(priceItem.material_cost),
        labor_cost_per_unit: Number(priceItem.labor_cost),
        unit_cost: Number(priceItem.unit_cost),
        total_material_cost: totalMaterial,
        total_labor_cost: totalLabor,
        total_cost: totalCost,
        remarks: 'Local Phase 2 smoke test',
        category: priceItem.category,
      }],
    }],
  })
  if (saveError) throw saveError

  const { data: savedItem, error: savedItemError } = await supabase
    .from('boq_items')
    .select('*, price_list(version_id)')
    .eq('boq_id', sourceBoq.id)
    .single()
  if (savedItemError) throw savedItemError
  assert(savedItem.category === priceItem.category, 'Saved item category snapshot does not match the catalog')
  assert(savedItem.price_list?.version_id === version.id, 'Saved item crossed catalog versions')

  const { data: duplicateBoq, error: duplicateError } = await supabase
    .from('boq')
    .insert({
      estimator_name: 'Local Phase 2 QA',
      document_date: new Date().toISOString().slice(0, 10),
      project_name: `LOCAL QA Master Catalog copy ${runId}`,
      route: 'Local QA route',
      construction_area: 'Local only',
      department: 'Local rehearsal',
      total_material_cost: totalMaterial,
      total_labor_cost: totalLabor,
      total_cost: totalCost,
      factor_f: 1,
      total_with_factor_f: totalCost,
      total_with_vat: totalCost,
      status: 'draft',
      created_by: authData.user.id,
      org_id: profile.org_id,
      department_id: profile.department_id,
      sector_id: profile.sector_id,
      price_list_version_id: sourceBoq.price_list_version_id,
    })
    .select('id, price_list_version_id')
    .single()
  if (duplicateError) throw duplicateError
  createdBoqIds.push(duplicateBoq.id)

  const { data: sourceRoute, error: sourceRouteError } = await supabase
    .from('boq_routes')
    .select('*')
    .eq('boq_id', sourceBoq.id)
    .single()
  if (sourceRouteError) throw sourceRouteError

  const { data: duplicateRoute, error: duplicateRouteError } = await supabase
    .from('boq_routes')
    .insert({
      boq_id: duplicateBoq.id,
      route_order: sourceRoute.route_order,
      route_name: sourceRoute.route_name,
      route_description: sourceRoute.route_description,
      construction_area: sourceRoute.construction_area,
      total_material_cost: sourceRoute.total_material_cost,
      total_labor_cost: sourceRoute.total_labor_cost,
      total_cost: sourceRoute.total_cost,
      cost_with_factor_f: sourceRoute.cost_with_factor_f,
    })
    .select('id')
    .single()
  if (duplicateRouteError) throw duplicateRouteError

  const { data: duplicateItem, error: duplicateItemError } = await supabase
    .from('boq_items')
    .insert({
      boq_id: duplicateBoq.id,
      route_id: duplicateRoute.id,
      item_order: savedItem.item_order,
      price_list_id: savedItem.price_list_id,
      item_name: savedItem.item_name,
      quantity: savedItem.quantity,
      unit: savedItem.unit,
      material_cost_per_unit: savedItem.material_cost_per_unit,
      labor_cost_per_unit: savedItem.labor_cost_per_unit,
      unit_cost: savedItem.unit_cost,
      total_material_cost: savedItem.total_material_cost,
      total_labor_cost: savedItem.total_labor_cost,
      total_cost: savedItem.total_cost,
      remarks: savedItem.remarks,
      category: savedItem.category,
    })
    .select('category')
    .single()
  if (duplicateItemError) throw duplicateItemError

  assert(duplicateBoq.price_list_version_id === version.id, 'Duplicate BOQ changed catalog version')
  assert(duplicateItem.category === savedItem.category, 'Duplicate item lost its category snapshot')

  console.log(JSON.stringify({
    status: 'passed',
    catalog_version: version.version_string,
    price_item: priceItem.item_code,
    create_version_preserved: true,
    save_category_preserved: true,
    duplicate_version_preserved: true,
    duplicate_category_preserved: true,
  }))
} finally {
  await cleanup()
  await supabase.auth.signOut()
}
