import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import type { Property } from "@/lib/types";

interface FlyerProps {
  property: Property;
  agentName: string;
  agentPhone: string;
  agentEmail: string;
  brokerageName: string;
  variant?: string;
}

const red = "#dc2626";
const darkRed = "#991b1b";
const black = "#111827";
const medGray = "#6b7280";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
    color: black,
  },
  header: {
    backgroundColor: red,
    paddingVertical: 10,
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLabel: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    letterSpacing: 3,
  },
  headerMls: {
    fontSize: 8,
    color: "#fecaca",
  },
  photoContainer: {
    height: 280,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 24,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  photo: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  noPhoto: {
    fontSize: 14,
    color: medGray,
  },
  priceSection: {
    paddingHorizontal: 24,
    paddingTop: 14,
  },
  price: {
    fontSize: 30,
    fontFamily: "Helvetica-Bold",
    color: red,
  },
  address: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: black,
    marginTop: 4,
  },
  cityLine: {
    fontSize: 11,
    color: medGray,
    marginTop: 2,
  },
  divider: {
    height: 2,
    backgroundColor: red,
    marginHorizontal: 24,
    marginVertical: 10,
  },
  thinDivider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginHorizontal: 24,
    marginVertical: 8,
  },
  detailsTable: {
    marginHorizontal: 24,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 4,
  },
  detailRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  detailRowLast: {
    flexDirection: "row",
  },
  detailLabel: {
    width: "35%",
    backgroundColor: "#f9fafb",
    paddingVertical: 6,
    paddingHorizontal: 10,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: medGray,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  detailValue: {
    width: "65%",
    paddingVertical: 6,
    paddingHorizontal: 10,
    fontSize: 9,
    color: black,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: red,
    marginBottom: 6,
    paddingHorizontal: 24,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  descriptionSection: {
    paddingHorizontal: 24,
    marginTop: 4,
  },
  description: {
    fontSize: 9,
    color: "#374151",
    lineHeight: 1.5,
  },
  featuresSection: {
    paddingHorizontal: 24,
    marginTop: 8,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  featureItem: {
    width: "50%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  featureBullet: {
    fontSize: 8,
    color: red,
    marginRight: 4,
  },
  featureText: {
    fontSize: 8,
    color: "#374151",
  },
  bottomSection: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  agentSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderTopWidth: 2,
    borderTopColor: red,
  },
  agentName: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: black,
  },
  agentBrokerage: {
    fontSize: 9,
    color: red,
    fontFamily: "Helvetica-Bold",
    marginTop: 2,
  },
  agentContact: {
    fontSize: 8,
    color: medGray,
    marginTop: 2,
  },
  qrPlaceholder: {
    width: 56,
    height: 56,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  qrText: {
    fontSize: 6,
    color: medGray,
    textAlign: "center",
  },
  footer: {
    backgroundColor: black,
    paddingVertical: 6,
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontSize: 8,
    color: "#ffffff",
    fontFamily: "Helvetica-Bold",
  },
  footerMls: {
    fontSize: 7,
    color: "#9ca3af",
  },
});

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

export default function ClassicFlyer({
  property,
  agentName,
  agentPhone,
  agentEmail,
  brokerageName,
  variant,
}: FlyerProps) {
  const label = variant || "JUST LISTED";
  const descriptionText = property.description
    ? property.description.length > 350
      ? property.description.slice(0, 350) + "..."
      : property.description
    : null;

  const displayFeatures = property.features.slice(0, 10);
  const hasPhoto = property.photos.length > 0;

  const detailRows: { label: string; value: string }[] = [
    { label: "Bedrooms", value: String(property.bedrooms) },
    { label: "Bathrooms", value: String(property.bathrooms) },
    { label: "Square Feet", value: formatNumber(property.sqft) },
  ];
  if (property.lot_size) {
    detailRows.push({
      label: "Lot Size",
      value: `${formatNumber(property.lot_size)} sq ft`,
    });
  }
  if (property.year_built) {
    detailRows.push({ label: "Year Built", value: String(property.year_built) });
  }
  detailRows.push({
    label: "Property Type",
    value: property.property_type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
  });

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerLabel}>{label}</Text>
          <Text style={styles.headerMls}>MLS# {property.mls_id}</Text>
        </View>

        {/* Photo */}
        <View style={styles.photoContainer}>
          {hasPhoto ? (
            <Image src={property.photos[0]} style={styles.photo} />
          ) : (
            <Text style={styles.noPhoto}>No Photo Available</Text>
          )}
        </View>

        {/* Price & Address */}
        <View style={styles.priceSection}>
          <Text style={styles.price}>{formatPrice(property.price)}</Text>
          <Text style={styles.address}>{property.address}</Text>
          <Text style={styles.cityLine}>
            {property.city}, {property.state} {property.zip}
          </Text>
        </View>

        <View style={styles.divider} />

        {/* Details Table */}
        <View style={styles.detailsTable}>
          {detailRows.map((row, i) => (
            <View
              key={i}
              style={
                i < detailRows.length - 1
                  ? styles.detailRow
                  : styles.detailRowLast
              }
            >
              <Text style={styles.detailLabel}>{row.label}</Text>
              <Text style={styles.detailValue}>{row.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.thinDivider} />

        {/* Description */}
        {descriptionText && (
          <>
            <Text style={styles.sectionTitle}>Description</Text>
            <View style={styles.descriptionSection}>
              <Text style={styles.description}>{descriptionText}</Text>
            </View>
            <View style={styles.thinDivider} />
          </>
        )}

        {/* Features */}
        {displayFeatures.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Features</Text>
            <View style={styles.featuresSection}>
              <View style={styles.featuresGrid}>
                {displayFeatures.map((feature, i) => (
                  <View key={i} style={styles.featureItem}>
                    <Text style={styles.featureBullet}>&#9654;</Text>
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          <View style={styles.agentSection}>
            <View>
              <Text style={styles.agentName}>{agentName}</Text>
              <Text style={styles.agentBrokerage}>{brokerageName}</Text>
              <Text style={styles.agentContact}>
                {agentPhone} | {agentEmail}
              </Text>
            </View>
            <View style={styles.qrPlaceholder}>
              <Text style={styles.qrText}>QR{"\n"}CODE</Text>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Listed on OneMLS.pro</Text>
            <Text style={styles.footerMls}>MLS# {property.mls_id}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
