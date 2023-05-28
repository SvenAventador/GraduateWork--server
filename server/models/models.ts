const sequelize = require('./db')
const {DataTypes} = require('sequelize')

const User = sequelize.define('user', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    userName: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    userEmail: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    userPassword: {
        type: DataTypes.STRING,
        allowNull: false
    },
    userRole: {
        type: DataTypes.STRING,
        defaultValue: "USER"
    },

    userFio: {
        type: DataTypes.STRING,
        allowNull: true
    },
    userAddress: {
        type: DataTypes.STRING,
        allowNull: true
    },
    userPhone: {
        type: DataTypes.STRING,
        allowNull: true
    }
})

const Cart = sequelize.define('cart', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    }
})

const CartDevice = sequelize.define('cart_device', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    amountDevice: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    }
})

const Order = sequelize.define('order', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    dateOrder: {
        type: DataTypes.DATEONLY,
        defaultValue: Date.now()
    },
    orderPrice: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
})

const DeliveryStatus = sequelize.define('delivery_status', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    deliveryName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
})

const PaymentStatus = sequelize.define('payment_status', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    paymentName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
})

const Rating = sequelize.define('rating', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    rate: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
})

const Device = sequelize.define('device', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    deviceName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    devicePrice: {
        type: DataTypes.DECIMAL,
        allowNull: false
    },
    rating: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    deviceDescription: {
        type: DataTypes.TEXT,
        allowNull: false
    }
})

const Color = sequelize.define('color', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    colorName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    hexValue: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
})

const DeviceMaterial = sequelize.define('device_material', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    materialName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
})

const WirelessType = sequelize.define('wireless_type', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    typeName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
})

const DeviceInfo = sequelize.define('device_info', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    infoTitle: {
        type: DataTypes.STRING,
        allowNull: false
    },
    infoDescription: {
        type: DataTypes.TEXT,
        allowNull: false
    }
})

const DeviceImage = sequelize.define('device_image', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    imagePath: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    isMainImage: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
})


const OrderDevice = sequelize.define('order_device', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    }
})

const Type = sequelize.define('type', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    typeName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
})

const Brand = sequelize.define('brand', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    brandName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
})

const TypeBrand = sequelize.define('type_brand', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    }
})

User.hasOne(Cart)
Cart.belongsTo(User)

User.hasMany(Order)
Order.belongsTo(User)

Cart.hasMany(CartDevice)
CartDevice.belongsTo(Cart)

DeliveryStatus.hasMany(Order)
Order.belongsTo(DeliveryStatus)

PaymentStatus.hasMany(Order)
Order.belongsTo(PaymentStatus)

User.hasMany(Rating)
Rating.belongsTo(User)

Device.hasMany(Rating)
Rating.belongsTo(Device)

Device.hasMany(CartDevice)
CartDevice.belongsTo(Device)

Order.hasMany(OrderDevice)
OrderDevice.belongsTo(Order)

Device.hasMany(OrderDevice)
OrderDevice.belongsTo(Device)

Device.hasMany(DeviceInfo, {as: 'info'})
DeviceInfo.belongsTo(Device)

Device.hasMany(DeviceImage, {as: 'images'})
DeviceImage.belongsTo(Device)

Type.hasMany(Device)
Device.belongsTo(Type)

Brand.hasMany(Device)
Device.belongsTo(Brand)

Color.hasMany(Device)
Device.belongsTo(Color)

DeviceMaterial.hasMany(Device)
Device.belongsTo(DeviceMaterial)

WirelessType.hasMany(Device)
Device.belongsTo(WirelessType)

Type.belongsToMany(Brand, {through: TypeBrand})
Brand.belongsToMany(Type, {through: TypeBrand})

module.exports = {
    User,
    Cart,
    CartDevice,
    Order,
    DeliveryStatus,
    PaymentStatus,
    Rating,
    Device,
    DeviceInfo,
    OrderDevice,
    Type,
    Brand,
    DeviceImage,
    TypeBrand,
    Color,
    DeviceMaterial,
    WirelessType,
}