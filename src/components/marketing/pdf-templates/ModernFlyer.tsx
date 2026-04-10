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

const blue = "#3b82f6";
const darkBlue = "#1e40af";
const darkText = "#1e293b";
const lightGray = "#f8fafc";
const medGray = "#64748b";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
    color: darkText,
  },
  photoContainer: {
    height: 280,
    backgroundColor: lightGray,
    justifyContent: "center",
    alignItems: "center",
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
  labelBadge: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: blue,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  labelText: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    letterSpacing: 2,
  },
  statsBar: {
    backgroundColor: blue,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
  },
  statLabel: {
    fontSize: 7,
    color: "#dbeafe",
    letterSpacing: 1,
    marginTop: 2,
  },
  body: {
    paddingHorizontal: 32,
    paddingTop: 18,
  },
  price: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    color: darkBlue,
  },
  address: {
    fontSize: 13,
    color: darkText,
    marginTop: 4,
  },
  cityLine: {
    fontSize: 11,
    color: medGray,
    marginTop: 2,
  },
  mlsLine: {
    fontSize: 8,
    color: medGray,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: blue,
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  description: {
    fontSize: 9,
    color: "#475569",
    lineHeight: 1.6,
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
  featureDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: blue,
    marginRight: 6,
  },
  featureText: {
    fontSize: 8,
    color: "#475569",
  },
  agentCard: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  agentInner: {
    marginHorizontal: 32,
    marginBottom: 12,
    backgroundColor: lightGray,
    borderRadius: 8,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  agentName: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: darkText,
  },
  agentDetail: {
    fontSize: 8,
    color: medGray,
    marginTop: 2,
  },
  qrPlaceholder: {
    width: 54,
    height: 54,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  qrText: {
    fontSize: 6,
    color: medGray,
    textAlign: "center",
  },
  footer: {
    backgroundColor: darkText,
    paddingVertical: 6,
    paddingHorizontal: 32,
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
    color: "#94a3b8",
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

export default function ModernFlyer({
  property,
  agentName,
  agentPhone,
  agentEmail,
  brokerageName,
  variant,
}: FlyerProps) {
  const label = variant || "JUST LISTED";
  const descriptionText = property.description
    ? property.description.length > 400
      ? property.description.slice(0, 400) + "..."
      : property.description
    : null;

  const displayFeatures = property.features.slice(0, 10);
  const hasPhoto = property.photos.length > 0;

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Hero Photo */}
        <View style={styles.photoContainer}>
          {hasPhoto ? (
            <Image src={property.photos[0]} style={styles.photo} />
          ) : (
            <Text style={styles.noPhoto}>No Photo Available</Text>
          )}
          <View style={styles.labelBadge}>
            <Text style={styles.labelText}>{label}</Text>
          </View>
        </View>

        {/* Stats Bar */}
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{property.bedrooms}</Text>
            <Text style={styles.statLabel}>BEDS</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{property.bathrooms}</Text>
            <Text style={styles.statLabel}>BATHS</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {formatNumber(property.sqft)}
            </Text>
            <Text style={styles.statLabel}>SQ FT</Text>
          </View>
          {property.lot_size && (
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {formatNumber(property.lot_size)}
              </Text>
              <Text style={styles.statLabel}>LOT</Text>
            </View>
          )}
          {property.year_built && (
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{property.year_built}</Text>
              <Text style={styles.statLabel}>BUILT</Text>
            </View>
          )}
        </View>

        {/* Body */}
        <View style={styles.body}>
          <Text style={styles.price}>{formatPrice(property.price)}</Text>
          <Text style={styles.address}>{property.address}</Text>
          <Text style={styles.cityLine}>
            {property.city}, {property.state} {property.zip}
          </Text>
          <Text style={styles.mlsLine}>MLS# {property.mls_id}</Text>

          <View style={styles.divider} />

          {/* Description */}
          {descriptionText && (
            <View>
              <Text style={styles.sectionTitle}>ABOUT THIS HOME</Text>
              <Text style={styles.description}>{descriptionText}</Text>
              <View style={styles.divider} />
            </View>
          )}

          {/* Features */}
          {displayFeatures.length > 0 && (
            <View>
              <Text style={styles.sectionTitle}>FEATURES</Text>
              <View style={styles.featuresGrid}>
                {displayFeatures.map((feature, i) => (
                  <View key={i} style={styles.featureItem}>
                    <View style={styles.featureDot} />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Agent Card */}
        <View style={styles.agentCard}>
          <View style={styles.agentInner}>
            <View>
              <Text style={styles.agentName}>{agentName}</Text>
              <Text style={styles.agentDetail}>{brokerageName}</Text>
              <Text style={styles.agentDetail}>{agentPhone}</Text>
              <Text style={styles.agentDetail}>{agentEmail}</Text>
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
