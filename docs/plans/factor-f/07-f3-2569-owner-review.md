# Factor F 2569.0.0 Owner Review Pack

**Status:** Local migration verified - do not execute Production until owner
approval is complete
**Date prepared:** 2026-06-28
**Target version:** `2569.0.0`
**Baseline version for diff:** `2566.0.0`
**Source reference:** หนังสือกรมบัญชีกลาง ด่วนที่สุด ที่ กค 0433.2/ว 481
ลงวันที่ 26 มิถุนายน 2569

## 1. Source Evidence

| Check | Result |
|---|---|
| Local PDF | `/Users/cloud/Cloudstellar/conduit-boq/files/ว481ลว26มิย69-ตารางFactorดอกเบี้ยเงินกู้ร้อยละ6.pdf` |
| Local image | `/Users/cloud/Cloudstellar/conduit-boq/files/factorF_26มิย69.jpg` |
| PDF pages | 54 |
| Table page reviewed | PDF page 17, marked `1/12` |
| Table type | ตาราง Factor F งานก่อสร้างทาง |
| Effective/source date | 2026-06-26 |
| Advance payment | 0% |
| Retention | 0% |
| Loan interest | 6% per year |
| VAT display | 7% |
| Visible row count | 36 |

## 2. Proposed Version Metadata

| Field | Proposed value |
|---|---|
| `major.minor.patch` | `2569.0.0` |
| `name` | `CGD Factor F road construction 6 percent W481 (2569.0.0)` |
| `effective_date` | `2026-06-26` |
| `source_document_date` | `2026-06-26` |
| `source_reference` | `Comptroller General Department Factor F road construction table, urgent circular KorKhor 0433.2/W481 dated 2026-06-26.` |
| `advance_payment_percent` | `0.0000` |
| `retention_percent` | `0.0000` |
| `loan_interest_percent` | `6.0000` |
| Version metadata `vat_percent` | `7.0000` |
| Row `vat_percent` | `1.0700` to preserve the existing `factor_reference` row contract |
| Row component percentages | `NULL` for `operation_percent`, `interest_percent`, `profit_percent`, `total_expense_percent` because the W481 table page does not show them |
| Print/Excel label for BOQs bound to this version | `ใช้ Factor F เวอร์ชัน 2569.0.0` |

## 3. Validation Summary

| Check | Result |
|---|---|
| New row count | 36 |
| Baseline row count | 37 |
| Duplicate new thresholds | 0 |
| Min/max new threshold | 5 / 700 million |
| New thresholds missing from baseline | 0 |
| Baseline thresholds removed by new source | 600 million |
| Dataset hash | `sha256:4f35b267bde3007439aebb193be1e53bdcea5a7acce95b5a7bbf5828018ef1a6` |
| Local migration rehearsal | Passed on 2026-06-28; default pointer moved to `2569.0.0` in Local only |
| Local BOQ backfill check | Passed; existing BOQ `factor_reference_version_id` count remained unchanged |

The W481 table does not include a 600 million row. If approved as-is, BOQs
between 500 and 700 million will interpolate directly between the 500 and 700
rows.

The dataset hash is computed from the same `numeric(10,4)::text` representation
used by `factor_reference_rows` postconditions, so it is tied to the actual
stored database row contract rather than a display-only number format.

Print and Excel labels must follow each BOQ's bound
`boq.factor_reference_version_id`. BOQs bound to `2566.0.0` must continue to
show `ใช้ Factor F เวอร์ชัน 2566.0.0`; BOQs bound to `2569.0.0` show
`ใช้ Factor F เวอร์ชัน 2569.0.0`. Legacy BOQs with no bound version must not
claim the latest version automatically.

Legacy BOQs with no bound Factor F version remain historical records. If a user
wants to calculate the same project data with the current Factor F table, the
application must create a new BOQ copy bound to the current default Factor F
version instead of updating the old BOQ in place.

If the work must continue under the old-factor policy, the same copy flow should
allow selecting the old active baseline version, such as `2566.0.0`, instead of
backfilling the original BOQ.

## 4. Row-Level Diff For Review

Delta columns are `new - old` compared with baseline `2566.0.0`.

| # | Cost M | Label | Factor old | Factor new | Delta | Factor F old | Factor F new | Delta | Rain 1 old | Rain 1 new | Delta | Rain 2 old | Rain 2 new | Delta |
|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 5 | <= 5 | 1.2750 | 1.2733 | -0.0017 | 1.3642 | 1.3624 | -0.0018 | 1.3848 | 1.3821 | -0.0027 | 1.4054 | 1.4018 | -0.0036 |
| 2 | 10 | 10 | 1.2274 | 1.2258 | -0.0016 | 1.3133 | 1.3116 | -0.0017 | 1.3345 | 1.3319 | -0.0026 | 1.3557 | 1.3522 | -0.0035 |
| 3 | 20 | 20 | 1.1730 | 1.1713 | -0.0017 | 1.2551 | 1.2532 | -0.0019 | 1.2742 | 1.2715 | -0.0027 | 1.2933 | 1.2897 | -0.0036 |
| 4 | 30 | 30 | 1.1422 | 1.1405 | -0.0017 | 1.2221 | 1.2203 | -0.0018 | 1.2394 | 1.2367 | -0.0027 | 1.2567 | 1.2531 | -0.0036 |
| 5 | 40 | 40 | 1.1359 | 1.1343 | -0.0016 | 1.2154 | 1.2137 | -0.0017 | 1.2342 | 1.2316 | -0.0026 | 1.2530 | 1.2495 | -0.0035 |
| 6 | 50 | 50 | 1.1310 | 1.1294 | -0.0016 | 1.2101 | 1.2084 | -0.0017 | 1.2290 | 1.2264 | -0.0026 | 1.2480 | 1.2445 | -0.0035 |
| 7 | 60 | 60 | 1.1254 | 1.1237 | -0.0017 | 1.2041 | 1.2023 | -0.0018 | 1.2230 | 1.2203 | -0.0027 | 1.2418 | 1.2382 | -0.0036 |
| 8 | 70 | 70 | 1.1201 | 1.1184 | -0.0017 | 1.1985 | 1.1966 | -0.0019 | 1.2177 | 1.2150 | -0.0027 | 1.2370 | 1.2334 | -0.0036 |
| 9 | 80 | 80 | 1.1168 | 1.1152 | -0.0016 | 1.1949 | 1.1932 | -0.0017 | 1.2143 | 1.2117 | -0.0026 | 1.2336 | 1.2301 | -0.0035 |
| 10 | 90 | 90 | 1.1113 | 1.1097 | -0.0016 | 1.1890 | 1.1873 | -0.0017 | 1.2078 | 1.2052 | -0.0026 | 1.2265 | 1.2230 | -0.0035 |
| 11 | 100 | 100 | 1.1083 | 1.1066 | -0.0017 | 1.1858 | 1.1840 | -0.0018 | 1.2042 | 1.2015 | -0.0027 | 1.2226 | 1.2190 | -0.0036 |
| 12 | 110 | 110 | 1.0996 | 1.0979 | -0.0017 | 1.1765 | 1.1747 | -0.0018 | 1.1945 | 1.1918 | -0.0027 | 1.2125 | 1.2089 | -0.0036 |
| 13 | 120 | 120 | 1.0989 | 1.0972 | -0.0017 | 1.1758 | 1.1740 | -0.0018 | 1.1940 | 1.1913 | -0.0027 | 1.2122 | 1.2086 | -0.0036 |
| 14 | 130 | 130 | 1.0960 | 1.0944 | -0.0016 | 1.1727 | 1.1710 | -0.0017 | 1.1906 | 1.1880 | -0.0026 | 1.2085 | 1.2050 | -0.0035 |
| 15 | 140 | 140 | 1.0949 | 1.0932 | -0.0017 | 1.1715 | 1.1697 | -0.0018 | 1.1895 | 1.1868 | -0.0027 | 1.2076 | 1.2040 | -0.0036 |
| 16 | 150 | 150 | 1.0935 | 1.0918 | -0.0017 | 1.1700 | 1.1682 | -0.0018 | 1.1879 | 1.1852 | -0.0027 | 1.2057 | 1.2021 | -0.0036 |
| 17 | 160 | 160 | 1.0925 | 1.0908 | -0.0017 | 1.1689 | 1.1671 | -0.0018 | 1.1869 | 1.1842 | -0.0027 | 1.2049 | 1.2013 | -0.0036 |
| 18 | 170 | 170 | 1.0917 | 1.0900 | -0.0017 | 1.1681 | 1.1663 | -0.0018 | 1.1860 | 1.1833 | -0.0027 | 1.2039 | 1.2003 | -0.0036 |
| 19 | 180 | 180 | 1.0911 | 1.0894 | -0.0017 | 1.1674 | 1.1656 | -0.0018 | 1.1853 | 1.1825 | -0.0028 | 1.2031 | 1.1995 | -0.0036 |
| 20 | 190 | 190 | 1.0893 | 1.0875 | -0.0018 | 1.1655 | 1.1636 | -0.0019 | 1.1843 | 1.1815 | -0.0028 | 1.2031 | 1.1994 | -0.0037 |
| 21 | 200 | 200 | 1.0890 | 1.0874 | -0.0016 | 1.1652 | 1.1635 | -0.0017 | 1.1840 | 1.1814 | -0.0026 | 1.2027 | 1.1992 | -0.0035 |
| 22 | 210 | 210 | 1.0884 | 1.0867 | -0.0017 | 1.1645 | 1.1627 | -0.0018 | 1.1835 | 1.1808 | -0.0027 | 1.2024 | 1.1988 | -0.0036 |
| 23 | 220 | 220 | 1.0873 | 1.0856 | -0.0017 | 1.1634 | 1.1615 | -0.0019 | 1.1821 | 1.1794 | -0.0027 | 1.2009 | 1.1973 | -0.0036 |
| 24 | 230 | 230 | 1.0864 | 1.0848 | -0.0016 | 1.1624 | 1.1607 | -0.0017 | 1.1810 | 1.1784 | -0.0026 | 1.1997 | 1.1962 | -0.0035 |
| 25 | 240 | 240 | 1.0852 | 1.0836 | -0.0016 | 1.1611 | 1.1594 | -0.0017 | 1.1796 | 1.1770 | -0.0026 | 1.1980 | 1.1945 | -0.0035 |
| 26 | 250 | 250 | 1.0841 | 1.0825 | -0.0016 | 1.1599 | 1.1582 | -0.0017 | 1.1782 | 1.1756 | -0.0026 | 1.1965 | 1.1930 | -0.0035 |
| 27 | 260 | 260 | 1.0831 | 1.0815 | -0.0016 | 1.1588 | 1.1572 | -0.0016 | 1.1770 | 1.1744 | -0.0026 | 1.1951 | 1.1916 | -0.0035 |
| 28 | 270 | 270 | 1.0822 | 1.0805 | -0.0017 | 1.1579 | 1.1561 | -0.0018 | 1.1759 | 1.1732 | -0.0027 | 1.1939 | 1.1903 | -0.0036 |
| 29 | 280 | 280 | 1.0813 | 1.0797 | -0.0016 | 1.1569 | 1.1552 | -0.0017 | 1.1749 | 1.1722 | -0.0027 | 1.1928 | 1.1891 | -0.0037 |
| 30 | 290 | 290 | 1.0805 | 1.0789 | -0.0016 | 1.1561 | 1.1544 | -0.0017 | 1.1738 | 1.1712 | -0.0026 | 1.1915 | 1.1880 | -0.0035 |
| 31 | 300 | 300 | 1.0798 | 1.0781 | -0.0017 | 1.1553 | 1.1535 | -0.0018 | 1.1730 | 1.1702 | -0.0028 | 1.1905 | 1.1869 | -0.0036 |
| 32 | 350 | 350 | 1.0794 | 1.0777 | -0.0017 | 1.1549 | 1.1531 | -0.0018 | 1.1724 | 1.1697 | -0.0027 | 1.1899 | 1.1864 | -0.0035 |
| 33 | 400 | 400 | 1.0781 | 1.0764 | -0.0017 | 1.1535 | 1.1517 | -0.0018 | 1.1712 | 1.1685 | -0.0027 | 1.1890 | 1.1854 | -0.0036 |
| 34 | 450 | 450 | 1.0779 | 1.0762 | -0.0017 | 1.1533 | 1.1515 | -0.0018 | 1.1710 | 1.1683 | -0.0027 | 1.1887 | 1.1851 | -0.0036 |
| 35 | 500 | 500 | 1.0768 | 1.0751 | -0.0017 | 1.1521 | 1.1503 | -0.0018 | 1.1698 | 1.1671 | -0.0027 | 1.1875 | 1.1839 | -0.0036 |
| 36 | 700 | >= 700 | 1.0744 | 1.0727 | -0.0017 | 1.1496 | 1.1477 | -0.0019 | 1.1668 | 1.1641 | -0.0027 | 1.1841 | 1.1805 | -0.0036 |

## 5. Owner Approval Checklist

- [ ] The table is the correct W481 `งานก่อสร้างทาง` table.
- [ ] Version `2569.0.0` is the correct identity.
- [ ] Row count 36 is correct.
- [ ] The missing 600 million row is expected and approved.
- [ ] The row values in section 4 match the official source.
- [ ] Row component percentages should remain `NULL`.
- [ ] Row `vat_percent` should be stored as `1.0700`, while version metadata
      `vat_percent` remains `7.0000`.
- [ ] Print and Excel should show the Factor F version bound to that BOQ,
      for example `ใช้ Factor F เวอร์ชัน 2569.0.0` only for BOQs bound to this
      version.
- [ ] Legacy BOQs should offer a create-copy/reprice path to a selected active
      Factor F version, without mutating the old BOQ.
- [ ] Dataset hash
      `sha256:4f35b267bde3007439aebb193be1e53bdcea5a7acce95b5a7bbf5828018ef1a6`
      is approved for migration `014_factor_f_publish_2569_0_0.sql`.
